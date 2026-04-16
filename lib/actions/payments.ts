"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import { LIMIT } from "@/lib/utils";
import { generateCashPaymentCode } from "@/lib/actions/common"
import { Prisma } from "@/generated/prisma/client"
import type { PendingPayment, AddPaymentInput } from "@/lib/types"


export async function getPendingPayments({
    page = 1,
    search = "",
}: {
    page?: number;
    search?: string;
}) {
    try {
        await requirePermission("transaction", "read");

        const skip = (page - 1) * LIMIT;

        const where = {
            type: "dispensed" as const,
            payment: null, // No payment record
            ...(search && {
                OR: [
                    { patient: { contains: search, mode: "insensitive" as const } },
                    { phone: { contains: search, mode: "insensitive" as const } },
                    {
                        stockEntry: {
                            medicine: {
                                name: { contains: search, mode: "insensitive" as const },
                            },
                        },
                    },
                ],
            }),
        };

        const [transactions, totalCount] = await Promise.all([
            prisma.transactions.findMany({
                where,
                select: {
                    id: true,
                    quantity: true,
                    patient: true,
                    phone: true,
                    createdAt: true,
                    stockEntry: {
                        select: {
                            batchNumber: true,
                            medicine: {
                                select: {
                                    name: true,
                                    unit: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: LIMIT,
            }),
            prisma.transactions.count({ where }),
        ]);

        const payments: PendingPayment[] = transactions.map((t) => ({
            id: t.id,
            quantity: t.quantity,
            patient: t.patient ?? "Unknown",
            phone: t.phone ?? "N/A",
            createdAt: t.createdAt,
            medicine: {
                name: t.stockEntry.medicine.name,
                unit: t.stockEntry.medicine.unit,
            },
            batch: {
                batchNumber: t.stockEntry.batchNumber,
            },
        }));

        const totalPages = Math.ceil(totalCount / LIMIT);

        return {
            payments,
            totalCount,
            totalPages,
            currentPage: page,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    } catch (error) {
        console.error("Failed to get pending payments:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get pending payments.");
    }
}

export async function addPaymentToTransaction(data: AddPaymentInput) {
    try {
        await requirePermission("transaction", "create");

        // Check if transaction exists and doesn't have a payment
        const transaction = await prisma.transactions.findUnique({
            where: { id: data.transactionId },
            include: {
                payment: true,
                stockEntry: {
                    select: {
                        medicine: { select: { name: true } },
                    },
                },
            },
        });

        if (!transaction) {
            throw new Error("Transaction not found.")
        }

        if (transaction.type !== "dispensed") {
            throw new Error("Payment can only be added to dispense transactions.")
        }

        if (transaction.payment) {
            throw new Error("This transaction already has a payment recorded.")
        }

        // Generate cash payment code if needed
        let paymentCode = data.paymentCode;
        if (data.method === "cash") {
            paymentCode = await generateCashPaymentCode();
        }

        if (!paymentCode) {
            throw new Error("Payment code is required.")
        }

        // Create payment
        await prisma.payment.create({
            data: {
                transactionId: data.transactionId,
                method: data.method,
                amount: data.amount,
                paymentCode,
            },
        });

        revalidatePath("/transactions/pending-payments");
        revalidatePath("/transactions");

        return {
            success: true,
            message: `Payment of KSH ${data.amount} recorded for ${transaction.stockEntry.medicine.name}.`,
            paymentCode,
        };
    } catch (error) {
        console.error("Failed to add payment:", error);

        /* &&
            error.message.includes(`Unique constraint failed on the fields: ("paymentCode")"`) */


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

        throw new Error("Failed to add payment.");
    }
}

export async function getPendingPaymentsCount() {
    try {
        const count = await prisma.transactions.count({
            where: {
                type: "dispensed",
                payment: null,
            },
        });
        return count;
    } catch (error) {
        console.error("Failed to get pending payments count:", error);
        return 0;
    }
}