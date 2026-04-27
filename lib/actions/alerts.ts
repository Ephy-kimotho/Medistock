"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/check-permissions";
import type { ALERT_STATUS, ALERT_TYPE } from "@/generated/prisma/client";
import { LIMIT } from "@/lib/utils"


export interface AlertFilters {
    status?: ALERT_STATUS | "all";
    type?: ALERT_TYPE | "all";
    page?: number;
    pageSize?: number;
}

export interface AlertWithDetails {
    id: string;
    type: ALERT_TYPE;
    message: string;
    status: ALERT_STATUS;
    createdAt: Date;
    readAt: Date;
    stockEntry: {
        id: string;
        batchNumber: string;
        quantity: number;
    };
    medicine: {
        id: string;
        name: string;
        unit: string;
        reorderlevel: number;
    };
    currentStock: number;
}

export interface AlertCounts {
    all: number;
    pending: number;
    read: number;
    dismissed: number;
}


export async function getAlerts(filters: AlertFilters = {}) {
    try {
        await requirePermission("medicine", "read");

        const { status = "all", type = "all", page = 1 } = filters;

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
                },
                orderBy: [{ status: "asc" }, { createdAt: "desc" }],
                skip: (page - 1) * LIMIT,
                take: LIMIT,
            }),
            prisma.alerts.count({ where }),
        ]);

        // Transform to include current stock calculation
        const alertsWithDetails: AlertWithDetails[] = alerts.map((alert) => ({
            id: alert.id,
            type: alert.type,
            message: alert.message,
            status: alert.status,
            createdAt: alert.createdAt,
            readAt: alert.readAt,
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
                pageSize: LIMIT,
                totalPages: Math.ceil(total / LIMIT),
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

        const [all, pending, read, dismissed] = await Promise.all([
            prisma.alerts.count(),
            prisma.alerts.count({ where: { status: "pending" } }),
            prisma.alerts.count({ where: { status: "read" } }),
            prisma.alerts.count({ where: { status: "dismissed" } }),
        ]);

        return {
            success: true,
            data: { all, pending, read, dismissed } as AlertCounts,
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

export async function dismissAlert(alertId: string) {
    try {
        await requirePermission("medicine", "update");

        const alert = await prisma.alerts.update({
            where: { id: alertId },
            data: {
                status: "dismissed",
            },
        });

        return { success: true, data: alert };
    } catch (error) {
        console.error("Failed to dismiss alert:", error);
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to dismiss alert",
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

export async function deleteAlert(alertId: string) {
    try {
        await requirePermission("medicine", "soft-delete");

        await prisma.alerts.delete({
            where: { id: alertId },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete alert:", error);
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to delete alert",
        };
    }
}