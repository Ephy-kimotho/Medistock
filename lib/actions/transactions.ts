"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession, requirePermission } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { LIMIT } from "@/lib/utils";
import type {
    TransactionFilters,
    TransactionWithDetails,
} from "@/lib/types";

export async function getTransactionStats(userId?: string) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            redirect("/login");
        }

        const currentUser = session.user;
        const isRegularUser = currentUser.role === "user";

        // Regular users only see their own stats
        const userFilter = isRegularUser
            ? { userId: currentUser.id }
            : userId && userId !== "all"
                ? { userId }
                : {};

        const [
            totalTransactions,
            stockInTransactions,
            dispensedTransactions,
            wastageTransactions,
        ] = await Promise.all([
            prisma.transactions.count({ where: userFilter }),
            prisma.transactions.count({
                where: { ...userFilter, type: "stock_in" },
            }),
            prisma.transactions.count({
                where: { ...userFilter, type: "dispensed" },
            }),
            prisma.transactions.count({
                where: { ...userFilter, type: "wastage" },
            }),
        ]);

        return {
            totalTransactions,
            stockInTransactions,
            dispensedTransactions,
            wastageTransactions,
        };
    } catch (error) {
        console.error("Error fetching transaction history stats: ", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to fetch transaction stats!");
    }
}

export async function getTransactions({
    page = 1,
    search = "",
    type = "all",
    medicineId = "all",
    userId = "all",
    fromDate,
    toDate,
}: TransactionFilters) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            redirect("/login");
        }

        const currentUser = session.user;
        const isRegularUser = currentUser.role === "user";
        const isAdmin = currentUser.role === "admin" || currentUser.role === "hr" || currentUser.role === "auditor" || currentUser.role === "inventory_manager";

        // Build where clause
        const where: Prisma.TransactionsWhereInput = {};

        // Regular users only see their own transactions
        if (isRegularUser) {
            where.userId = currentUser.id;
        } else if (isAdmin && userId !== "all") {
            // Admins can filter by user
            where.userId = userId;

        }

        // Filter by transaction type
        if (type !== "all") {
            where.type = type as "stock_in" | "dispensed" | "wastage";
        }

        // Filter by medicine
        if (medicineId !== "all") {
            where.stockEntry = {
                medicineId,
            };
        }

        // Filter by date range
        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate) {
                where.createdAt.gte = startOfDay(new Date(fromDate));
            }
            if (toDate) {
                where.createdAt.lte = endOfDay(new Date(toDate));
            }
        }

        // Search by medicine name, batch number, patient name, or user name
        if (search.trim()) {
            where.OR = [
                {
                    stockEntry: {
                        medicine: {
                            name: { contains: search.trim(), mode: "insensitive" },
                        },
                    },
                },
                {
                    stockEntry: {
                        batchNumber: { contains: search.trim(), mode: "insensitive" },
                    },
                },
                {
                    patient: { contains: search.trim(), mode: "insensitive" },
                },
                {
                    user: {
                        name: { contains: search.trim(), mode: "insensitive" },
                    },
                },
            ];
        }

        // Get total count for pagination
        const totalItems = await prisma.transactions.count({ where });

        // Fetch transactions with related data
        const transactions = await prisma.transactions.findMany({
            where,
            include: {
                stockEntry: {
                    include: {
                        medicine: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * LIMIT,
            take: LIMIT,
        });

        // Transform data for the frontend
        const formattedTransactions: TransactionWithDetails[] = transactions.map(
            (tx) => ({
                id: tx.id,
                date: tx.createdAt,
                type: tx.type,
                medicineName: tx.stockEntry.medicine.name,
                quantity: tx.quantity,
                batchNumber: tx.stockEntry.batchNumber,
                userName: tx.user.name,
                userRole: tx.user.role,
                patient: tx.patient,
                reason: tx.reason,
                phone: tx.phone
            })
        );

        const totalPages = Math.ceil(totalItems / LIMIT);

        return {
            transactions: formattedTransactions,
            totalItems,
            totalPages,
            currentPage: page,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    } catch (error) {
        console.error("Error fetching transactions: ", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to fetch transactions!");
    }
}

export async function getTransactionUsers() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            redirect("/login");
        }

        // Only admins can get user list
        if (session.user.role !== "admin") {
            return [];
        }

        const users = await prisma.user.findMany({
            where: {
                banned: false,
                role: {
                    not: "hr"
                }

            },
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: "asc" },
        });

        return users;
    } catch (error) {
        console.error("Error fetching transaction users: ", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to fetch users list!");
    }
}

export async function getTransactionById(
    id: string
) {
    try {
        await requirePermission("transaction", "read");

        const transaction = await prisma.transactions.findUnique({
            where: { id },
            include: {
                stockEntry: {
                    include: {
                        medicine: {
                            select: {
                                id: true,
                                name: true,
                                unit: true,
                                ageGroup: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        paymentCode: true,
                        createdAt: true,
                        processedBy: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
            },
        });

        if (!transaction) {
            return null;
        }

        return {
            id: transaction.id,
            type: transaction.type,
            quantity: transaction.quantity,
            reason: transaction.reason,
            notes: transaction.notes,
            createdAt: transaction.createdAt,
            patient: transaction.patient,
            phone: transaction.phone,
            patientAgeGroup: transaction.patientAgeGroup,
            medicine: {
                id: transaction.stockEntry.medicine.id,
                name: transaction.stockEntry.medicine.name,
                unit: transaction.stockEntry.medicine.unit,
                ageGroup: transaction.stockEntry.medicine.ageGroup,
            },
            batch: {
                id: transaction.stockEntry.id,
                batchNumber: transaction.stockEntry.batchNumber,
                expiryDate: transaction.stockEntry.expiryDate,
            },
            user: {
                id: transaction.user.id,
                name: transaction.user.name,
                role: transaction.user.role,
            },
            payment: transaction.payment
                ? {
                    id: transaction.payment.id,
                    amount: transaction.payment.amount,
                    method: transaction.payment.method,
                    paymentCode: transaction.payment.paymentCode,
                    createdAt: transaction.payment.createdAt,
                    processedBy: transaction.payment.processedBy.name
                }
                : null,
        };
    } catch (error) {
        console.error("Failed to get transaction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get transaction.");
    }
}