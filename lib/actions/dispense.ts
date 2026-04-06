"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import { isBefore } from "date-fns";
import type { DispenseInput } from "@/lib/types"

export async function getBatchesByMedicine(medicineId: string) {
    try {
        const now = new Date();

        // Fetch batches for this medicine
        const batches = await prisma.stockEntries.findMany({
            where: {
                medicineId,
                quantity: { gt: 0 }, // Only batches with stock
                expiryDate: { gt: now }, // Exclude expired batches
            },
            select: {
                id: true,
                batchNumber: true,
                quantity: true,
                expiryDate: true,
            },
            orderBy: {
                expiryDate: "asc", // FEFO - First Expired, First Out
            },
        });

        return batches;
    } catch (error) {
        console.error("Failed to get batches: ", error);
        throw new Error("Failed to get batches for this medicine.");
    }
}

export async function dispenseMedicine(data: DispenseInput, userId: string) {
    try {
        await requirePermission("transaction", "create");

        // Get the batch to validate quantity
        const batch = await prisma.stockEntries.findUnique({
            where: { id: data.stockEntriesId },
            select: {
                id: true,
                quantity: true,
                expiryDate: true,
                medicine: {
                    select: { name: true, ageGroup: true },
                },
            },
        });

        if (!batch) {
            throw new Error("Batch not found.");
        }

        // Validate age group match
        if (
            batch.medicine.ageGroup !== "all_ages" &&
            batch.medicine.ageGroup !== data.patientAgeGroup
        ) {
            return {
                success: false,
                message: `Cannot dispense: ${batch.medicine.name} is for ${batch.medicine.ageGroup} patients, but patient is ${data.patientAgeGroup}.`,
            };
        }

        // Check if batch has expired
        if (isBefore(new Date(batch.expiryDate), new Date())) {
            throw new Error("Cannot dispense from an expired batch.");
        }

        // Check if enough quantity is available
        if (data.quantity > batch.quantity) {
            throw new Error(
                `Insufficient stock. Only ${batch.quantity} units available.`
            );
        }

        // Use transaction to ensure atomicity
        await prisma.$transaction([
            // Create transaction record
            prisma.transactions.create({
                data: {
                    stockEntriesId: data.stockEntriesId,
                    type: "dispensed",
                    quantity: data.quantity,
                    patientAgeGroup: data.patientAgeGroup,
                    reason: "Dispensed to patient",
                    patient: data.patient,
                    phone: data.phone,
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

        revalidatePath("/transactions");
        revalidatePath("/inventory/stock");
        revalidatePath("/transactions/dispense");

        return {
            success: true,
            message: `Successfully dispensed ${data.quantity} units of ${batch.medicine.name} to ${data.patient}.`,
        };
    } catch (error) {
        console.error("Failed to dispense medicine: ", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to dispense medicine.");
    }
}