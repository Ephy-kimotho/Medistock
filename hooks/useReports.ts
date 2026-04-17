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
import { downloadPdf } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";


export function useEmployeeDirectoryReport() {
    return useMutation({
        mutationFn: (filters: EmployeeDirectoryFilters) =>
            generateEmployeeDirectoryReport(filters),
        onSuccess: (result) => {
            if (result.success && result.data) {
                const filename = `employee-directory-${format(new Date(), "yyyy-MM-dd")}.pdf`;
                downloadPdf(result.data, filename);
                toast.success("Report downloaded successfully");
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
                const filename = `employee-activity-${format(new Date(), "yyyy-MM-dd")}.pdf`;
                downloadPdf(result.data, filename);
                toast.success("Report downloaded successfully");
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
                const filename = `role-distribution-${format(new Date(), "yyyy-MM-dd")}.pdf`;
                downloadPdf(result.data, filename);
                toast.success("Report downloaded successfully");
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
                const filename = `stock-level-${format(new Date(), "yyyy-MM-dd")}.pdf`;
                downloadPdf(result.data, filename);
                toast.success("Report downloaded successfully");
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
                const filename = `low-stock-${format(new Date(), "yyyy-MM-dd")}.pdf`;
                downloadPdf(result.data, filename);
                toast.success("Report downloaded successfully");
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
                const filename = `expiry-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
                downloadPdf(result.data, filename);
                toast.success("Report downloaded successfully");
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
                const filename = `dispensing-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
                downloadPdf(result.data, filename);
                toast.success("Report downloaded successfully");
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
                const filename = `wastage-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
                downloadPdf(result.data, filename);
                toast.success("Report downloaded successfully");
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
                const filename = `sales-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
                downloadPdf(result.data, filename);
                toast.success("Report downloaded successfully");
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