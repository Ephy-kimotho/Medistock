"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
    generateEmployeeDirectoryReport,
    generateEmployeeActivityReport,
    generateRoleDistributionReport,
    getEmployeesForReport,
    type EmployeeDirectoryFilters,
    type EmployeeActivityFilters,
    type RoleDistributionFilters,
} from "@/lib/actions/reports/hr-reports";
import {
    generateStockLevelReport,
    generateLowStockReport,
    getCategoriesForReport,
    generateExpiryReport,
    generateDispensingReport,
    generateWastageReport,
    type LowStockFilters,
    type StockLevelFilters,
    type ExpiryFilters,
    type DispensingFilters,
    type WastageReportFilters
} from "@/lib/actions/reports/inventory-reports";
import {
    generateSalesReport,
    type SalesReportFilters,
} from "@/lib/actions/reports/financial-reports";
import { toast } from "sonner";



export function useEmployeeDirectoryReport() {
    return useMutation({
        mutationFn: (filters: EmployeeDirectoryFilters) =>
            generateEmployeeDirectoryReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success("Report generated successfully");
            } else {
                toast.error(result.message ?? "Failed to generate report");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate report"
            );
        },
    });
}

export function useEmployeesForReport() {
    return useQuery({
        queryKey: ["employees-for-report"],
        queryFn: () => getEmployeesForReport(),
    });
}

export function useEmployeeActivityReport() {
    return useMutation({
        mutationFn: (filters: EmployeeActivityFilters) =>
            generateEmployeeActivityReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success("Report generated successfully");
            } else {
                toast.error(result.message ?? "Failed to generate report");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate report"
            );
        },
    });
}

export function useRoleDistributionReport() {
    return useMutation({
        mutationFn: (filters: RoleDistributionFilters) =>
            generateRoleDistributionReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success("Report generated successfully");
            } else {
                toast.error(result.message ?? "Failed to generate report");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate report"
            );
        },
    });
}

export function useCategoriesForReport() {
    return useQuery({
        queryKey: ["categories-for-report"],
        queryFn: () => getCategoriesForReport(),
    });
}

export function useStockLevelReport() {
    return useMutation({
        mutationFn: (filters: StockLevelFilters) =>
            generateStockLevelReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success("Report generated successfully");
            } else {
                toast.error(result.message ?? "Failed to generate report");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate report"
            );
        },
    });
}

export function useLowStockReport() {
    return useMutation({
        mutationFn: (filters: LowStockFilters) => generateLowStockReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success("Report generated successfully");
            } else {
                toast.error(result.message ?? "Failed to generate report");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate report"
            );
        },
    });
}

export function useExpiryReport() {
    return useMutation({
        mutationFn: (filters: ExpiryFilters) => generateExpiryReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success("Report generated successfully");
            } else {
                toast.error(result.message ?? "Failed to generate report");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate report"
            );
        },
    });
}

export function useDispensingReport() {
    return useMutation({
        mutationFn: (filters: DispensingFilters) =>
            generateDispensingReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success("Report generated successfully");
            } else {
                toast.error(result.message ?? "Failed to generate report");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate report"
            );
        },
    });
}

export function useWastageReport() {
    return useMutation({
        mutationFn: (filters: WastageReportFilters) =>
            generateWastageReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success("Report generated successfully");
            } else {
                toast.error(result.message ?? "Failed to generate report");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate report"
            );
        },
    });
}

export function useSalesReport() {
    return useMutation({
        mutationFn: (filters: SalesReportFilters) => generateSalesReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                toast.success("Report generated successfully");
            } else {
                toast.error(result.message ?? "Failed to generate report");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate report"
            );
        },
    });
}