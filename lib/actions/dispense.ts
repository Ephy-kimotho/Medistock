"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import { isBefore } from "date-fns";
import { generateCashPaymentCode } from "@/lib/actions/common";
import { Prisma, MEDICINE_AGE_GROUP } from "@/generated/prisma/client"
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

/*  export async function dispenseMedicine(data: DispenseInput, userId: string) {
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

        // Generate cash payment code if needed
        let paymentCode = data.paymentCode;
        if (data.collectPayment && data.paymentMethod === "cash") {
            paymentCode = await generateCashPaymentCode();
        }

        // Use interactive transaction to get the created transaction ID
        const result = await prisma.$transaction(async (tx) => {
            // Create transaction record
            const transaction = await tx.transactions.create({
                data: {
                    stockEntriesId: data.stockEntriesId,
                    type: "dispensed",
                    quantity: data.quantity,
                    patientAgeGroup: data.patientAgeGroup,
                    reason: "Dispensed to patient",
                    patient: data.patient,
                    phone: data.phone,
                    notes: data.notes,
                    userId,
                },
            });

            // Decrement batch quantity
            await tx.stockEntries.update({
                where: { id: data.stockEntriesId },
                data: {
                    quantity: { decrement: data.quantity },
                },
            });

            // Create payment if collecting payment
            if (data.collectPayment && data.paymentMethod && data.paymentAmount) {
                await tx.payment.create({
                    data: {
                        transactionId: transaction.id,
                        method: data.paymentMethod,
                        amount: data.paymentAmount,
                        paymentCode: paymentCode!,
                        processedById: userId
                    },
                });
            }

            return transaction;
        });

        revalidatePath("/transactions");
        revalidatePath("/inventory/stock");
        revalidatePath("/transactions/dispense");
        revalidatePath("/transactions/pending-payments");

        const paymentMessage = data.collectPayment
            ? ` Payment of KSH ${data.paymentAmount} recorded.`
            : "";

        return {
            success: true,
            message: `Successfully dispensed ${data.quantity} units of ${batch.medicine.name} to ${data.patient}.${paymentMessage}`,
            transactionId: result.id,
        };
    } catch (error: unknown) {
        console.error("Failed to dispense medicine:", error);

        

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new Error(
                "This payment code already exists. Please use a different code."
            );
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Failed to dispense medicine.");
    }
} 
 */




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

        // Handle patient - either create new or use existing
        let patientId: string;
        let patientName: string;

        if (data.isNewPatient) {
            // Check if patient with this phone already exists
            const existingPatient = await prisma.patient.findUnique({
                where: { phone: data.phone },
            });

            if (existingPatient) {
                // Use existing patient
                patientId = existingPatient.id;
                patientName = existingPatient.name;
            } else {
                // Validate age group match for new patients
                if (
                    batch.medicine.ageGroup !== "all_ages" &&
                    batch.medicine.ageGroup !== data.patientAgeGroup
                ) {
                    return {
                        success: false,
                        message: `Cannot dispense: ${batch.medicine.name} is for ${batch.medicine.ageGroup} patients, but patient is ${data.patientAgeGroup}.`,
                    };
                }

                // Create new patient
                const newPatient = await prisma.patient.create({
                    data: {
                        name: data.patient!,
                        phone: data.phone!,
                        ageGroup: data.patientAgeGroup as MEDICINE_AGE_GROUP,
                    },
                });
                patientId = newPatient.id;
                patientName = newPatient.name;
            }
        } else {
            // Returning patient - use provided patientId
            const patient = await prisma.patient.findUnique({
                where: { id: data.patientId },
                select: { id: true, name: true, ageGroup: true },
            });

            if (!patient) {
                throw new Error("Patient not found.");
            }

            // Validate age group match for returning patients
            if (
                batch.medicine.ageGroup !== "all_ages" &&
                batch.medicine.ageGroup !== patient.ageGroup
            ) {
                return {
                    success: false,
                    message: `Cannot dispense: ${batch.medicine.name} is for ${batch.medicine.ageGroup} patients, but ${patient.name} is ${patient.ageGroup}.`,
                };
            }

            patientId = patient.id;
            patientName = patient.name;
        }

        // Generate cash payment code if needed
        let paymentCode = data.paymentCode;
        if (data.collectPayment && data.paymentMethod === "cash") {
            paymentCode = await generateCashPaymentCode();
        }

        // Use interactive transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create transaction record with patientId reference
            const transaction = await tx.transactions.create({
                data: {
                    stockEntriesId: data.stockEntriesId,
                    type: "dispensed",
                    quantity: data.quantity,
                    reason: "Dispensed to patient",
                    patientId,
                    notes: data.notes,
                    userId,
                },
            });

            // Decrement batch quantity
            await tx.stockEntries.update({
                where: { id: data.stockEntriesId },
                data: {
                    quantity: { decrement: data.quantity },
                },
            });

            // Create payment if collecting payment
            if (data.collectPayment && data.paymentMethod && data.paymentAmount) {
                await tx.payment.create({
                    data: {
                        transactionId: transaction.id,
                        method: data.paymentMethod,
                        amount: data.paymentAmount,
                        paymentCode: paymentCode!,
                        processedById: userId,
                    },
                });
            }

            return transaction;
        });

        revalidatePath("/transactions");
        revalidatePath("/inventory/stock");
        revalidatePath("/transactions/dispense");
        revalidatePath("/transactions/pending-payments");

        const paymentMessage = data.collectPayment
            ? ` Payment of KSH ${data.paymentAmount} recorded.`
            : "";

        return {
            success: true,
            message: `Successfully dispensed ${data.quantity} units of ${batch.medicine.name} to ${patientName}.${paymentMessage}`,
            transactionId: result.id,
        };
    } catch (error: unknown) {
        console.error("Failed to dispense medicine:", error);

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new Error(
                "This payment code already exists. Please use a different code."
            );
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Failed to dispense medicine.");
    }
}