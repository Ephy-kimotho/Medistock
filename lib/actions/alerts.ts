"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/check-permissions";
import type { AlertFilters, AlertWithDetails, AlertCounts } from "@/lib/types";
import type { ALERT_STATUS, ALERT_TYPE } from "@/generated/prisma/client"


export async function getAlerts(filters: AlertFilters = {}) {
    try {
        await requirePermission("medicine", "read");

        const { status = "all", type = "all", page = 1, pageSize = 20 } = filters;

        const where: {
            status?: ALERT_STATUS;
            type?: ALERT_TYPE;
        } = {};

        if (status !== "all") {
            where.status = status;
        }

        if (type !== "all") {
            where.type = type;
        }

        const [alerts, total] = await Promise.all([
            prisma.alerts.findMany({
                where,
                include: {
                    stockEntry: {
                        select: {
                            id: true,
                            batchNumber: true,
                            quantity: true,
                        },
                    },
                    medicines: {
                        select: {
                            id: true,
                            name: true,
                            unit: true,
                            reorderlevel: true,
                            stockEntries: {
                                where: { quantity: { gt: 0 } },
                                select: { quantity: true },
                            },
                        },
                    },
                    resolvedBy: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: [{ status: "asc" }, { createdAt: "desc" }],
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.alerts.count({ where }),
        ]);

        const alertsWithDetails: AlertWithDetails[] = alerts.map((alert) => ({
            id: alert.id,
            type: alert.type,
            message: alert.message,
            status: alert.status,
            createdAt: alert.createdAt,
            readAt: alert.readAt,
            resolvedAt: alert.resolvedAt,
            resolvedBy: alert.resolvedBy,
            stockEntry: alert.stockEntry,
            medicine: {
                id: alert.medicines.id,
                name: alert.medicines.name,
                unit: alert.medicines.unit,
                reorderlevel: alert.medicines.reorderlevel,
            },
            currentStock: alert.medicines.stockEntries.reduce(
                (sum, entry) => sum + entry.quantity,
                0
            ),
        }));

        return {
            success: true,
            data: {
                alerts: alertsWithDetails,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    } catch (error) {
        console.error("Failed to fetch alerts:", error);
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to fetch alerts",
        };
    }
}


export async function getAlertCounts() {
    try {
        await requirePermission("medicine", "read");

        const [all, pending, read, resolved] = await Promise.all([
            prisma.alerts.count(),
            prisma.alerts.count({ where: { status: "pending" } }),
            prisma.alerts.count({ where: { status: "read" } }),
            prisma.alerts.count({ where: { status: "resolved" } }),
        ]);

        return {
            success: true,
            data: { all, pending, read, resolved } as AlertCounts,
        };
    } catch (error) {
        console.error("Failed to fetch alert counts:", error);
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to fetch alert counts",
        };
    }
}


export async function getPendingAlertCount() {
    try {
        await requirePermission("medicine", "read");

        const count = await prisma.alerts.count({
            where: { status: "pending" },
        });

        return { success: true, data: count };
    } catch (error) {
        console.error("Failed to fetch pending alert count:", error);
        return { success: false, message: "Failed to fetch count" };
    }
}


export async function markAlertAsRead(alertId: string) {
    try {
        await requirePermission("medicine", "read");

        const alert = await prisma.alerts.update({
            where: { id: alertId },
            data: {
                status: "read",
                readAt: new Date(),
            },
        });

        return { success: true, data: alert };
    } catch (error) {
        console.error("Failed to mark alert as read:", error);
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to mark alert as read",
        };
    }
}


export async function resolveAlert(alertId: string, userId: string) {
    try {
        await requirePermission("medicine", "update");

        const alert = await prisma.alerts.update({
            where: { id: alertId },
            data: {
                status: "resolved",
                resolvedById: userId,
                resolvedAt: new Date(),
            },
        });

        return { success: true, data: alert };
    } catch (error) {
        console.error("Failed to resolve alert:", error);
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to resolve alert",
        };
    }
}

export async function markAllAlertsAsRead() {
    try {
        await requirePermission("medicine", "update");

        const result = await prisma.alerts.updateMany({
            where: { status: "pending" },
            data: {
                status: "read",
                readAt: new Date(),
            },
        });

        return { success: true, data: { count: result.count } };
    } catch (error) {
        console.error("Failed to mark all alerts as read:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to mark all alerts as read",
        };
    }
}