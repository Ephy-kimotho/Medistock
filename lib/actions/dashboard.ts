"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";

export async function getRecentTransactionsAdmin() {
    try {
        const session = await getServerSession();

        if (!session) {
            redirect("/login");
        }

        const transactions = await prisma.transactions.findMany({
            select: {
                id: true,
                type: true,
                quantity: true,
                createdAt: true,
                stockEntry: {
                    select: {
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
                    },
                },
            },
            take: 5,
            orderBy: {
                createdAt: "desc",
            },
        });

        return transactions.map((tx) => ({
            id: tx.id,
            medicineName: tx.stockEntry.medicine.name,
            userName: tx.user.name,
            quantity: tx.quantity,
            type: tx.type,
            createdAt: tx.createdAt,
        }));
    } catch (error) {
        console.error("Error getting recent transactions: ", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get recent transactions");
    }
}

export async function getRecentTransactionsStaff() {
    try {
        const session = await getServerSession();

        if (!session) {
            redirect("/login");
        }

        const userId = session.user.id;

        const transactions = await prisma.transactions.findMany({
            where: {
                userId,
                type: "dispensed",
            },
            select: {
                id: true,
                quantity: true,
                patient: true,
                phone: true,
                createdAt: true,
                stockEntry: {
                    select: {
                        medicine: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            take: 5,
            orderBy: {
                createdAt: "desc",
            },
        });

        return transactions.map((tx) => ({
            id: tx.id,
            medicineName: tx.stockEntry.medicine.name,
            quantity: tx.quantity,
            patient: tx.patient,
            phone: tx.phone,
            createdAt: tx.createdAt,
        }));
    } catch (error) {
        console.error("Error getting staff transactions: ", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get recent transactions");
    }
}