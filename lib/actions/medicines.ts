"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/check-permissions";
import { LIMIT } from "@/lib/utils";
import { addDays, isBefore, isAfter } from "date-fns";
import type { MedicineInput, GetMedicinesParams } from "@/lib/types";


export async function getCategoryNames() {
    try {
        const categories = await prisma.category.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return categories;
    } catch (error) {
        console.error("Error getting category names:", error);
        throw error;
    }
}

export async function getMedicines({
    page = 1,
    search = "",
    categoryId = "all",
    status = "all",
}: GetMedicinesParams) {
    try {
        const session = await getServerSession();
        const user = session?.user

        if (!user) {
            redirect("/login");
        }

        const isAdminOrManager = user.role === "admin" || user.role === "inventory_manager"

        // Build the where clause dynamically
        const where: Prisma.MedicinesWhereInput = {

            ...(!isAdminOrManager && {
                isActive: true,
                deletedAt: null
            }),

            // Search filter
            ...(search !== "" && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { manufacturer: { contains: search, mode: "insensitive" } },
                ],
            }),

            // Category filter
            ...(categoryId !== "all" && {
                categoryId,
            }),
        };

        // For status filtering, we need to fetch all matching medicines first
        // then filter by calculated stock status
        const allMedicines = await prisma.medicines.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                stockEntries: {
                    select: {
                        quantity: true,
                    },
                },
            },
        });

        // Transform and calculate stock status
        const formattedMedicines = allMedicines.map((medicine) => {

            const totalStock = medicine.stockEntries.reduce(
                (sum, entry) => sum + entry.quantity,
                0
            );

            // Determine stock status
            let stockStatus: "in_stock" | "low_stock" | "out_of_stock";
            if (totalStock === 0) {
                stockStatus = "out_of_stock";
            } else if (totalStock <= medicine.reorderlevel) {
                stockStatus = "low_stock";
            } else {
                stockStatus = "in_stock";
            }

            return {
                id: medicine.id,
                name: medicine.name,
                unit: medicine.unit,
                reorderlevel: medicine.reorderlevel,
                categoryId: medicine.categoryId,
                categoryName: medicine.category.name,
                manufacturer: medicine.manufacturer,
                isActive: medicine.isActive,
                createdAt: medicine.createdAt,
                updatedAt: medicine.updatedAt,
                ageGroup: medicine.ageGroup as "infant" | "pediatric" | "adult" | "geriatric" | "all_ages",
                totalStock,
                stockStatus,
            };
        });

        // Filter by stock status
        const filteredMedicines =
            status === "all"
                ? formattedMedicines
                : formattedMedicines.filter((m) => m.stockStatus === status);

        // Manual pagination after status filtering
        const totalMedicines = filteredMedicines.length;
        const totalPages = Math.ceil(totalMedicines / LIMIT);
        const startIndex = (page - 1) * LIMIT;
        const paginatedMedicines = filteredMedicines.slice(
            startIndex,
            startIndex + LIMIT
        );

        const hasNext = page < totalPages;
        const hasPrev = page > 1 && page <= totalPages;

        return {
            medicines: paginatedMedicines,
            totalPages,
            currentPage: page,
            hasNext,
            hasPrev,
            totalMedicines,
        };
    } catch (error) {
        console.error("Error getting medicines:", error);
        throw error;
    }
}

export async function getMedicineStats() {
    try {
        const session = await getServerSession();

        if (!session) {
            redirect("/login");
        }

        // Get settings for expiryWarnDays
        const settings = await prisma.settings.findFirst();
        const expiryWarnDays = settings?.expiryWarnDays ?? 7;

        const now = new Date();
        const warnDate = addDays(now, expiryWarnDays);

        // Get all active medicines with their stock entries
        const medicines = await prisma.medicines.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            select: {
                id: true,
                reorderlevel: true,
                stockEntries: {
                    select: {
                        quantity: true,
                        expiryDate: true,
                    },
                },
            },
        });

        // Calculate stats
        const totalMedicines = medicines.length;
        let lowStockCount = 0;
        let expiringSoonCount = 0;
        let expiredCount = 0;

        for (const medicine of medicines) {
            // Calculate total stock for this medicine
            const totalStock = medicine.stockEntries.reduce(
                (sum, entry) => sum + entry.quantity,
                0
            );

            // Low stock: total stock > 0 AND total stock <= reorder level
            if (totalStock > 0 && totalStock <= medicine.reorderlevel) {
                lowStockCount++;
            }

            // Check each stock entry for expiry
            for (const entry of medicine.stockEntries) {
                // Only count entries with stock remaining
                if (entry.quantity > 0) {
                    const expiryDate = new Date(entry.expiryDate);

                    if (isBefore(expiryDate, now)) {
                        // Already expired
                        expiredCount++;
                    } else if (
                        isAfter(expiryDate, now) &&
                        isBefore(expiryDate, warnDate)
                    ) {
                        // Expiring soon (within expiryWarnDays)
                        expiringSoonCount++;
                    }
                }
            }
        }

        return {
            totalMedicines,
            lowStockCount,
            expiringSoonCount,
            expiredCount,
            expiryWarnDays,
        };
    } catch (error) {
        console.error("Error getting medicine stats:", error);
        throw error;
    }
}

export async function createMedicine(data: MedicineInput) {
    try {
        await requireRole(["admin", "inventory_manager"]);

        // Check if medicine already exists
        const existing = await prisma.medicines.findFirst({
            where: {
                name: { equals: data.name, mode: "insensitive" },
                isActive: true,
            },
        });

        if (existing) {
            throw new Error("A medicine with this name already exists");
        }

        const medicine = await prisma.medicines.create({
            data: {
                name: data.name,
                unit: data.unit,
                reorderlevel: data.reorderlevel,
                categoryId: data.categoryId,
                ageGroup: data.ageGroup,
                manufacturer: data.manufacturer || null,
            },
        });

        revalidatePath("/inventory/medicines");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: `${medicine.name.charAt(0).toUpperCase() + medicine.name.substring(1)} created successfully.`,
        };
    } catch (error) {
        console.error("Error creating medicine:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to create medicine");
    }
}

export async function updateMedicine(id: string, data: MedicineInput) {
    try {
        await requireRole(["admin", "inventory_manager"]);

        // Check if name already exists (excluding current medicine)
        const existing = await prisma.medicines.findFirst({
            where: {
                name: { equals: data.name, mode: "insensitive" },
                isActive: true,
                NOT: { id },
            },
        });

        if (existing) {
            throw new Error("A medicine with this name already exists");
        }

        const medicine = await prisma.medicines.update({
            where: { id },
            data: {
                name: data.name,
                unit: data.unit,
                reorderlevel: data.reorderlevel,
                categoryId: data.categoryId,
                ageGroup: data.ageGroup,
                manufacturer: data.manufacturer || null,
            },
        });

        revalidatePath("/inventory/medicines");

        return {
            success: true,
            message: `${medicine.name.charAt(0).toUpperCase() + medicine.name.substring(1)} updated successfully.`
        };
    } catch (error) {
        console.error("Error updating medicine:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to update medicine");
    }
}

export async function archiveMedicine(id: string) {
    try {
        await requireRole(["admin", "inventory_manager"]);

        // Check if medicine has stock
        const medicine = await prisma.medicines.findUnique({
            where: { id },
            include: {
                stockEntries: {
                    select: { quantity: true },
                },
            },
        });

        if (!medicine) {
            throw new Error("Medicine not found");
        }

        const totalStock = medicine.stockEntries.reduce(
            (sum, entry) => sum + entry.quantity,
            0
        );

        if (totalStock > 0) {
            throw new Error(
                `Cannot archive "${medicine.name}". There are still ${totalStock} units in stock. Please clear the stock first.`
            );
        }

        await prisma.medicines.update({
            where: { id },
            data: {
                isActive: false,
                deletedAt: new Date(),
            },
        });

        revalidatePath("/inventory/medicines");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: `${medicine.name} archived successfully`,
        };
    } catch (error) {
        console.error("Error archiving medicine:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to archive medicine");
    }
}

export async function restoreMedicine(id: string) {
    try {
        await requireRole(["admin", "inventory_manager"]);

        const medicine = await prisma.medicines.findUnique({
            where: { id },
        });

        if (!medicine) {
            throw new Error("Medicine not found");
        }

        if (medicine.isActive) {
            throw new Error("Medicine is already active");
        }

        await prisma.medicines.update({
            where: { id },
            data: {
                isActive: true,
                deletedAt: null,
            },
        });

        revalidatePath("/inventory/medicines");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: `${medicine.name} restored successfully`,
        };
    } catch (error) {
        console.error("Error restoring medicine:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to restore medicine");
    }
}

