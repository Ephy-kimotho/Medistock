import { prisma } from "@/lib/prisma";
import type { ALERT_TYPE } from "@/generated/prisma/client";


// Check and create low_stock or out_of_stock alerts after dispense/wastage
export async function checkAndCreateStockAlert(
    medicineId: string,
    stockEntryId: string
) {
    try {
        const medicine = await prisma.medicines.findUnique({
            where: { id: medicineId },
            select: {
                id: true,
                name: true,
                reorderlevel: true,
                stockEntries: {
                    where: { quantity: { gt: 0 } },
                    select: { quantity: true },
                },
            },
        });

        if (!medicine) return;

        const totalStock = medicine.stockEntries.reduce(
            (sum, entry) => sum + entry.quantity,
            0
        );

        let alertType: ALERT_TYPE | null = null;
        let message = "";

        if (totalStock === 0) {
            alertType = "out_of_stock";
            message = `${medicine.name} is out of stock.`;
        } else if (totalStock <= medicine.reorderlevel) {
            alertType = "low_stock";
            message = `${medicine.name} is below reorder level threshold.`;
        }

        if (!alertType) return;

        // Check if a pending alert of this type already exists
        const existingAlert = await prisma.alerts.findFirst({
            where: {
                medicinesId: medicineId,
                type: alertType,
                status: "pending",
            },
        });

        if (existingAlert) return;

        await prisma.alerts.create({
            data: {
                type: alertType,
                medicinesId: medicineId,
                stockEntriesId: stockEntryId,
                message,
                status: "pending",
            },
        });
    } catch (error) {
        console.error("Failed to create stock alert:", error);
    }
}

// Function to resolve alerts on restock
export async function resolveStockAlertsOnRestock(
    medicineId: string,
    userId: string
) {
    try {
        const medicine = await prisma.medicines.findUnique({
            where: { id: medicineId },
            select: {
                reorderlevel: true,
                stockEntries: {
                    where: { quantity: { gt: 0 } },
                    select: { quantity: true },
                },
            },
        });

        if (!medicine) return;

        const totalStock = medicine.stockEntries.reduce(
            (sum, entry) => sum + entry.quantity,
            0
        );

        const alertTypesToResolve: ALERT_TYPE[] = [];

        if (totalStock > 0) {
            alertTypesToResolve.push("out_of_stock");
        }

        if (totalStock > medicine.reorderlevel) {
            alertTypesToResolve.push("low_stock");
        }

        if (alertTypesToResolve.length === 0) return;

        await prisma.alerts.updateMany({
            where: {
                medicinesId: medicineId,
                type: { in: alertTypesToResolve },
                status: "pending",
            },
            data: {
                status: "resolved",
                resolvedById: userId,
                resolvedAt: new Date(),
            },
        });
    } catch (error) {
        console.error("Failed to resolve stock alerts:", error);
    }
}


// Check and create expiry alerts (for cron job)
export async function checkAndCreateExpiryAlerts(
    daysUntilExpiry: number = 30
) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const warningDate = new Date(today);
    warningDate.setDate(warningDate.getDate() + daysUntilExpiry);

    let createdCount = 0;
    const typeCount: Record<string, number> = {
        expired: 0,
        expiry_warning: 0,
    };

    try {
        const stockEntries = await prisma.stockEntries.findMany({
            where: {
                quantity: { gt: 0 },
                expiryDate: { lte: warningDate },
            },
            select: {
                id: true,
                batchNumber: true,
                expiryDate: true,
                medicineId: true,
                medicine: {
                    select: { name: true },
                },
            },
        });

        for (const entry of stockEntries) {
            const isExpired = entry.expiryDate < today;
            const alertType: ALERT_TYPE = isExpired ? "expired" : "expiry_warning";

            const existingAlert = await prisma.alerts.findFirst({
                where: {
                    stockEntriesId: entry.id,
                    type: alertType,
                    status: "pending",
                },
            });

            if (existingAlert) continue;

            const message = isExpired
                ? `${entry.medicine.name} (Batch: ${entry.batchNumber}) has expired`
                : `${entry.medicine.name} (Batch: ${entry.batchNumber}) expires on ${entry.expiryDate.toLocaleDateString()}`;

            await prisma.alerts.create({
                data: {
                    type: alertType,
                    medicinesId: entry.medicineId,
                    stockEntriesId: entry.id,
                    message,
                    status: "pending",
                },
            });

            createdCount++;
            typeCount[alertType]++;
        }

        return { created: createdCount, types: typeCount };
    } catch (error) {
        console.error("Failed to create expiry alerts:", error);
        return { created: 0, types: typeCount };
    }
}

// Check all medicines for stock level alerts (for cron job)
export async function checkAllStockLevelAlerts() {
    let createdCount = 0;
    const typeCount: Record<string, number> = {
        out_of_stock: 0,
        low_stock: 0,
    };

    try {
        const medicines = await prisma.medicines.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                reorderlevel: true,
                stockEntries: {
                    where: { quantity: { gt: 0 } },
                    select: {
                        id: true,
                        quantity: true,
                    },
                },
            },
        });

        for (const medicine of medicines) {
            const totalStock = medicine.stockEntries.reduce(
                (sum, entry) => sum + entry.quantity,
                0
            );

            let alertType: ALERT_TYPE | null = null;
            let message = "";

            if (totalStock === 0) {
                alertType = "out_of_stock";
                message = `${medicine.name} is out of stock`;
            } else if (totalStock <= medicine.reorderlevel) {
                alertType = "low_stock";
                message = `${medicine.name} is below reorder level`;
            }

            if (!alertType) continue;

            const existingAlert = await prisma.alerts.findFirst({
                where: {
                    medicinesId: medicine.id,
                    type: alertType,
                    status: "pending",
                },
            });

            if (existingAlert) continue;

            let linkStockEntryId: string | undefined = medicine.stockEntries[0]?.id;

            if (!linkStockEntryId) {
                const anyStockEntry = await prisma.stockEntries.findFirst({
                    where: { medicineId: medicine.id },
                    select: { id: true },
                });
                linkStockEntryId = anyStockEntry?.id;
            }

            if (!linkStockEntryId) continue;

            await prisma.alerts.create({
                data: {
                    type: alertType,
                    medicinesId: medicine.id,
                    stockEntriesId: linkStockEntryId,
                    message,
                    status: "pending",
                },
            });

            createdCount++;
            typeCount[alertType]++;
        }

        return { created: createdCount, types: typeCount };
    } catch (error) {
        console.error("Failed to create stock level alerts:", error);
        return { created: 0, types: typeCount };
    }
}