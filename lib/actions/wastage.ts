"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/check-permissions";
import { requirePermission } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isBefore } from "date-fns";
import { checkAndCreateStockAlert } from "@/lib/utils/stock-alerts"
import type { WastageInput } from "@/lib/types";

// Get batches including expired ones (for wastage recording)
export async function getBatchesForWastage(medicineId: string) {
    try {
        const session = await getServerSession();

        if (!session) {
            redirect("/login");
        }

        // Fetch all batches with stock (including expired)
        const batches = await prisma.stockEntries.findMany({
            where: {
                medicineId,
                quantity: { gt: 0 },
            },
            select: {
                id: true,
                batchNumber: true,
                quantity: true,
                expiryDate: true,
            },
            orderBy: {
                expiryDate: "asc",
            },
        });

        return batches;
    } catch (error) {
        console.error("Failed to get batches: ", error);
        throw new Error("Failed to get batches for this medicine.");
    }
}

// Server action to record medicine wastage
export async function recordWastage(data: WastageInput, userId: string) {
    try {
        await requirePermission("transaction", "create");

        // Get the batch to validate
        const batch = await prisma.stockEntries.findUnique({
            where: { id: data.stockEntriesId },
            select: {
                id: true,
                quantity: true,
                expiryDate: true,
                batchNumber: true,
                medicine: {
                    select: { id: true, name: true },
                },
            },
        });

        /*if (!batch) {
            throw new Error("Batch not found.");
        }

        // If reason is "expired", validate that the batch has actually expired
        if (data.reason === "expired") {
            const now = new Date();
            if (!isBefore(new Date(batch.expiryDate), now)) {
                throw new Error(
                    `This batch (${batch.batchNumber}) has not yet expired. Expiry date is ${new Date(batch.expiryDate).toLocaleDateString()}.`
                );
            }
        }

        // Check if enough quantity is available
        if (data.quantity > batch.quantity) {
            throw new Error(
                `Insufficient stock. Only ${batch.quantity} units available.`
            );
        } */
        // 

        if (!batch) {
            return { success: false, message: "Batch not found." };
        }

        if (data.reason === "expired") {
            const now = new Date();
            if (!isBefore(new Date(batch.expiryDate), now)) {
                return {
                    success: false,
                    message: `This batch (${batch.batchNumber}) has not yet expired. Expiry date is ${new Date(batch.expiryDate).toLocaleDateString()}.`,
                };
            }
        }

        if (data.quantity > batch.quantity) {
            return {
                success: false,
                message: `Insufficient stock. Only ${batch.quantity} units available.`,
            };
        }

        // Format reason for storage
        const reasonMap: Record<string, string> = {
            expired: "Expired",
            recalled: "Recalled by Manufacturer",
            spillage: "Spillage",
            damage: "Damage",
            other: "Other",
        };

        const formattedReason = data.notes
            ? `${reasonMap[data.reason]}: ${data.notes}`
            : reasonMap[data.reason];

        // Use transaction to ensure atomicity
        await prisma.$transaction([
            // Create transaction record
            prisma.transactions.create({
                data: {
                    stockEntriesId: data.stockEntriesId,
                    type: "wastage",
                    quantity: data.quantity,
                    reason: formattedReason,
                    userId,
                },
            }),
            // Decrement batch quantity
            prisma.stockEntries.update({
                where: { id: data.stockEntriesId },
                data: {
                    quantity: { decrement: data.quantity },
                },
            }),
        ]);

        if (data.reason !== "expired") {
            await checkAndCreateStockAlert(batch.medicine.id, data.stockEntriesId);
        }

        revalidatePath("/transactions/wastage");
        revalidatePath("/inventory/stock");

        return {
            success: true,
            message: `Successfully recorded wastage of ${data.quantity} units of ${batch.medicine.name}.`,
        };
    } catch (error) {
        console.error("Failed to record wastage: ", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to record wastage.",
        };
    }
}

//  Get all expired batches
export async function getExpiredBatches() {
    try {
        await requirePermission("transaction", "read");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiredBatches = await prisma.stockEntries.findMany({
            where: {
                expiryDate: { lt: today },
                quantity: { gt: 0 },
            },
            select: {
                id: true,
                batchNumber: true,
                quantity: true,
                expiryDate: true,
                medicine: {
                    select: {
                        id: true,
                        name: true,
                        unit: true,
                    },
                },
            },
            orderBy: { expiryDate: "asc" },
        });

        return expiredBatches;
    } catch (error) {
        console.error("Failed to get expired batches:", error);
        return [];
    }
}