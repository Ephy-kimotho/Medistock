"use server"

import { prisma } from "@/lib/prisma"


export async function getTransactionStats() {
    try {

        const totalTransactions = await prisma.transactions.count()

        const stockInTransactions = await prisma.transactions.count({
            where: {
                type: "stock_in"
            }
        })

        const dispensedTransactions = await prisma.transactions.count({
            where: {
                type: "dispensed"
            }
        })

        const wastageTransactions = await prisma.transactions.count({
            where: {
                type: "wastage"
            }
        })


        return {
            totalTransactions,
            stockInTransactions,
            dispensedTransactions,
            wastageTransactions
        }

    } catch (error) {
        console.error("Error fetching transaction history stats: ", error);
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error("Failed to fetch transaction stats!")
        }

    }
}