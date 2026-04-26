"use server"

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache"
import { addDays, isBefore, isAfter } from "date-fns";
import { StockInput } from "@/lib/types"
import { LIMIT } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client"
import type { GetStockInventoryProps } from "@/lib/types"


export async function getInventoryStats() {
    try {

        // Get settings for expiryWarnDays
        const settings = await prisma.settings.findFirst();
        const expiryWarnDays = settings?.expiryWarnDays ?? 30;

        const now = new Date();
        const warnDate = addDays(now, expiryWarnDays);

        // Get all stock entries with their medicine's reorder level
        const allStocks = await prisma.stockEntries.findMany({
            where: {
                quantity: { gt: 0 }, // Only count batches with stock remaining
            },
            select: {
                id: true,
                quantity: true,
                expiryDate: true,
                medicine: {
                    select: {
                        id: true,
                        reorderlevel: true,
                    },
                },
            },
        });

        // Calculate stats
        const totalBatches = allStocks.length;
        let lowStockCount = 0;
        let expiringSoonCount = 0;
        let expiredCount = 0;

        for (const stock of allStocks) {
            const expiryDate = new Date(stock.expiryDate);

            // Low stock: batch quantity <= medicine's reorder level
            if (stock.quantity <= stock.medicine.reorderlevel) {
                lowStockCount++;
            }

            // Check expiry status
            if (isBefore(expiryDate, now)) {
                // Already expired
                expiredCount++;
            } else if (isAfter(expiryDate, now) && isBefore(expiryDate, warnDate)) {
                // Expiring soon (within expiryWarnDays)
                expiringSoonCount++;
            }
        }

        return {
            totalBatches,
            lowStockCount,
            expiringSoonCount,
            expiredCount,
            expiryWarnDays,
        };
    } catch (error) {
        console.error("Failed to get inventory stats: ", error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error("Failed to get inventory statistics.");
        }
    }
}

export async function getMedicineNames() {
    try {
        const medicines = await prisma.medicines.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                ageGroup: true,
                dosage: true,
                unitPrice: true,
            },
            orderBy: { name: "asc" },
        })

        return medicines

    } catch (error) {
        console.error("Failed to get medicine names and IDs.", error)
        throw new Error("Failed to get medicine names")
    }

}

export async function getStockInventory({
    page = 1,
    search = "",
    medicineId = "all",
    status = "all",
}: GetStockInventoryProps) {
    try {

        // Get settings for expiryWarnDays
        const settings = await prisma.settings.findFirst();
        const expiryWarnDays = settings?.expiryWarnDays ?? 7;

        const now = new Date();
        const warnDate = addDays(now, expiryWarnDays);

        // Build the where clause dynamically
        const where: Prisma.StockEntriesWhereInput = {
            // search filter 
            ...(search !== "all" && {
                OR: [
                    {
                        batchNumber: { contains: search, mode: "insensitive" }
                    },
                    {
                        medicine: {
                            name: {
                                contains: search, mode: "insensitive"
                            }
                        }
                    }
                ]

            }),

            //medicine filter
            ...(medicineId !== "all" && {
                medicineId
            })

        };

        // Fetch all matching stocks (we need to filter by computed status)
        const allStocks = await prisma.stockEntries.findMany({
            where,
            include: {
                medicine: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        // Calculate stock status for each entry
        const stocksWithStatus = allStocks.map((stock) => {
            const expiryDate = new Date(stock.expiryDate);
            let stockStatus: "good" | "expiring_soon" | "expired";

            if (isBefore(expiryDate, now)) {
                stockStatus = "expired";
            } else if (isAfter(expiryDate, now) && isBefore(expiryDate, warnDate)) {
                stockStatus = "expiring_soon";
            } else {
                stockStatus = "good";
            }

            return {
                id: stock.id,
                medicineId: stock.medicineId,
                medicineName: stock.medicine.name,
                batchNumber: stock.batchNumber,
                quantity: stock.quantity,
                initialQuantity: stock.initialtQuantity,
                expiryDate: stock.expiryDate,
                purchaseDate: stock.purchaseDate,
                purchasePrice: stock.purchasePrice,
                supplier: stock.supplier,
                notes: stock.notes,
                stockStatus,
            };

        })


        // Filter by status if specified
        let filteredStocks = stocksWithStatus;

        if (status !== "all") {
            filteredStocks = stocksWithStatus.filter(
                (stock) => stock.stockStatus === status
            );
        }

        // Manual pagination
        const totalItems = filteredStocks.length;
        const totalPages = Math.ceil(totalItems / LIMIT);
        const startIndex = (page - 1) * LIMIT;
        const paginatedStocks = filteredStocks.slice(
            startIndex,
            startIndex + LIMIT
        );

        return {
            stocks: paginatedStocks,
            totalItems,
            totalPages,
            currentPage: page,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            expiryWarnDays,
        };

    } catch (error) {
        console.error("Failed to get stock inventory: ", error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error("Failed to get stock inventory.");
        }
    }
}

export async function addNewStock(data: StockInput, userId: string) {
    try {
        await requirePermission("stockEntry", "create")

        const existing = await prisma.stockEntries.findUnique({
            where: {
                batchNumber: data.batchNumber
            }
        })

        if (existing) {
            throw new Error("A batch with this batch number already exisits!")
        }


        // use a transaction to ensure database atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Add the new stock
            const stock = await tx.stockEntries.create({
                data
            })

            // 2. Create the transaction 
            await tx.transactions.create({
                data: {
                    stockEntriesId: stock.id,
                    quantity: stock.initialtQuantity,
                    type: "stock_in",
                    reason: "Medicine stock in",
                    userId
                }
            })

            return stock
        })


        revalidatePath("/inventory")

        return {
            success: true,
            message: "Batch added successfully.",
        }

    } catch (error) {
        console.error("Error adding new stock: ", error)
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error("Failed to add new batch.")
        }

    }
}
