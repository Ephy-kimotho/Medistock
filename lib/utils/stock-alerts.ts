import { prisma } from "@/lib/prisma";
import type { ALERT_TYPE } from "@/generated/prisma/client";


export async function checkAndCreateStockAlert(
    medicineId: string,
    stockEntryId: string
) {
    try {
        // Fetch medicine with reorder level and all stock entries
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

        // Calculate total stock
        const totalStock = medicine.stockEntries.reduce(
            (sum, entry) => sum + entry.quantity,
            0
        );

        // Determine alert type needed
        let alertType: ALERT_TYPE | null = null;
        let message = "";

        if (totalStock === 0) {
            alertType = "out_of_stock";
            message = `${medicine.name} is out of stock`;
        } else if (totalStock <= medicine.reorderlevel) {
            alertType = "low_stock";
            message = `${medicine.name} is below reorder level stock`;
        }

        // No alert needed
        if (!alertType) return;

        // Check if a pending alert of this type already exists for this medicine
        const existingAlert = await prisma.alerts.findFirst({
            where: {
                medicinesId: medicineId,
                type: alertType,
                status: "pending",
            },
        });

        // Don't create duplicate alerts
        if (existingAlert) return;

        // Create the alert
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
        // Log but don't throw - alerts are non-critical
        console.error("Failed to create stock alert:", error);
    }
}


export async function resolveStockAlertsOnRestock(
    medicineId: string
) {
    try {
        // Fetch medicine with reorder level and all stock entries
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

        // Calculate total stock
        const totalStock = medicine.stockEntries.reduce(
            (sum, entry) => sum + entry.quantity,
            0
        );

        // Determine which alerts to resolve
        const alertTypesToResolve: ALERT_TYPE[] = [];

        if (totalStock > 0) {
            // No longer out of stock
            alertTypesToResolve.push("out_of_stock");
        }

        if (totalStock > medicine.reorderlevel) {
            // No longer low stock
            alertTypesToResolve.push("low_stock");
        }

        if (alertTypesToResolve.length === 0) return;

        // Dismiss pending alerts of these types
        await prisma.alerts.updateMany({
            where: {
                medicinesId: medicineId,
                type: { in: alertTypesToResolve },
                status: "pending",
            },
            data: {
                status: "dismissed",
            },
        });
    } catch (error) {
        // Log but don't throw - alerts are non-critical
        console.error("Failed to resolve stock alerts:", error);
    }
}


export async function checkAndCreateExpiryAlerts(
    daysUntilExpiry: number = 30
): Promise<{ created: number; types: Record<string, number> }> {
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
        // Find stock entries that are expired or expiring soon
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

            // Check for existing pending alert for this specific batch
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


export async function checkAllStockLevelAlerts() {
    let createdCount = 0;
    const typeCount: Record<string, number> = {
        out_of_stock: 0,
        low_stock: 0,
    };

    try {
        // Fetch all active medicines with their stock
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
                message = `${medicine.name} is below reorder level stock`;
            }

            if (!alertType) continue;

            // Check for existing pending alert
            const existingAlert = await prisma.alerts.findFirst({
                where: {
                    medicinesId: medicine.id,
                    type: alertType,
                    status: "pending",
                },
            });

            if (existingAlert) continue;

            // Get a stock entry to link (use first one, or create without if none)
            const stockEntryId = medicine.stockEntries[0]?.id;

            // For out_of_stock, we need to find ANY stock entry for this medicine
            // since all current entries have 0 quantity
            let linkStockEntryId: string | undefined = stockEntryId;

            if (!linkStockEntryId) {
                const anyStockEntry = await prisma.stockEntries.findFirst({
                    where: { medicineId: medicine.id },
                    select: { id: true },
                });
                linkStockEntryId = anyStockEntry?.id;
            }

            // Skip if no stock entry exists at all
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