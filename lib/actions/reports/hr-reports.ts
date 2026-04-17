"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/check-permissions";
import { format } from "date-fns";
import {
    createPdfDocument,
    getFacilitySettings,
    generateHeader,
    generateFooter,
    generateFiltersSummary,
    generateStatsSummary,
    generateTable,
    pdfToBase64,
    type TableColumn,
    PDF_COLORS,
    PDF_FONTS,
    PDF_MARGINS
} from "@/lib/services/pdf/utils";


export interface EmployeeDirectoryFilters {
    role: string;
    status: string;
}

export interface EmployeeActivityFilters {
    employeeId: string;
    transactionType: string;
    dateFrom: string | null;
    dateTo: string | null;
}

export interface EmployeeOption {
    id: string;
    name: string;
    employeeId: string | null;
}

export interface RoleDistributionFilters {
    status: string;
}

function formatRole(role: string): string {
    switch (role) {
        case "admin":
            return "Admin";
        case "inventory_manager":
            return "Manager";
        case "hr":
            return "HR";
        case "auditor":
            return "Auditor";
        case "user":
            return "Pharmacist";
        default:
            return role;
    }
}


function formatTransactionType(type: string): string {
    switch (type) {
        case "dispensed":
            return "Dispense";
        case "stock_in":
            return "Stock In";
        case "wastage":
            return "Wastage";
        default:
            return type;
    }
}


export async function generateEmployeeDirectoryReport(
    filters: EmployeeDirectoryFilters
) {
    try {
        await requirePermission("user", "list");

        // Build query filters
        const where: Record<string, unknown> = {};

        if (filters.role !== "all") {
            where.role = filters.role;
        }

        if (filters.status === "active") {
            where.banned = false;
        } else if (filters.status === "banned") {
            where.banned = true;
        }

        // Fetch employees
        const employees = await prisma.user.findMany({
            where,
            select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                role: true,
                banned: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Get facility settings
        const facility = await getFacilitySettings();

        // Create PDF document
        const doc = createPdfDocument();

        // Generate header
        generateHeader(
            doc,
            facility.name,
            facility.address,
            "Employee Directory Report"
        );

        // Generate filters summary
        const filterLabels = [
            {
                label: "Role",
                value: filters.role === "all" ? "All Roles" : formatRole(filters.role),
            },
            {
                label: "Status",
                value:
                    filters.status === "all"
                        ? "All"
                        : filters.status === "active"
                            ? "Active"
                            : "Banned",
            },
        ];
        generateFiltersSummary(doc, filterLabels);

        // Generate stats summary
        const activeCount = employees.filter((e) => !e.banned).length;
        const bannedCount = employees.filter((e) => e.banned).length;
        generateStatsSummary(doc, [
            { label: "Total Employees", value: employees.length },
            { label: "Active", value: activeCount },
            { label: "Banned", value: bannedCount },
        ]);

        // Define table columns
        const columns: TableColumn[] = [
            { header: "Employee ID", key: "employeeId", width: 18 },
            { header: "Name", key: "name", width: 22 },
            { header: "Email", key: "email", width: 25 },
            { header: "Role", key: "role", width: 15 },
            { header: "Status", key: "status", width: 10, align: "center" },
            { header: "Joined", key: "joined", width: 10, align: "center" },
        ];

        // Prepare table data
        const tableData = employees.map((employee) => ({
            employeeId: employee.employeeId ?? "-",
            name: employee.name,
            email: employee.email,
            role: formatRole(employee.role),
            status: employee.banned ? "Banned" : "Active",
            joined: format(new Date(employee.createdAt), "MMM yyyy"),
        }));

        // Generate table
        const totalPages = generateTable(doc, columns, tableData);

        // Generate footer on last page
        generateFooter(doc, totalPages);

        // Convert to base64
        const base64 = await pdfToBase64(doc);

        return {
            success: true,
            data: base64,
        };
    } catch (error) {
        console.error("Failed to generate employee directory report:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to generate report",
        };
    }
}

export async function getEmployeesForReport() {
    try {
        await requirePermission("user", "list");

        const employees = await prisma.user.findMany({
            where: {
                role: { not: "hr" },
            },
            select: {
                id: true,
                name: true,
                employeeId: true,
            },
            orderBy: { name: "asc" },
        });

        return employees;
    } catch (error) {
        console.error("Failed to get employees for report:", error);
        return [];
    }
}

export async function generateEmployeeActivityReport(
    filters: EmployeeActivityFilters
) {
    try {
        await requirePermission("user", "list");

        // Build query filters
        const where: Record<string, unknown> = {};

        if (filters.employeeId !== "all") {
            where.userId = filters.employeeId;
        }

        if (filters.transactionType !== "all") {
            where.type = filters.transactionType;
        }

        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                (where.createdAt as Record<string, Date>).gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                (where.createdAt as Record<string, Date>).lte = toDate;
            }
        }

        // Fetch transactions with user and medicine details
        const transactions = await prisma.transactions.findMany({
            where,
            select: {
                id: true,
                type: true,
                quantity: true,
                reason: true,
                patient: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        employeeId: true,
                        role: true,
                    },
                },
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
            orderBy: { createdAt: "desc" },
        });

        // Get facility settings
        const facility = await getFacilitySettings();

        // Create PDF document
        const doc = createPdfDocument();

        // Generate header
        generateHeader(
            doc,
            facility.name,
            facility.address,
            "Employee Activity Report"
        );

        // Get employee name for filter display
        let employeeName = "All Employees";
        if (filters.employeeId !== "all") {
            const employee = await prisma.user.findUnique({
                where: { id: filters.employeeId },
                select: { name: true },
            });
            employeeName = employee?.name ?? "Unknown";
        }

        // Generate filters summary
        const filterLabels = [
            { label: "Employee", value: employeeName },
            {
                label: "Type",
                value:
                    filters.transactionType === "all"
                        ? "All Types"
                        : formatTransactionType(filters.transactionType),
            },
            {
                label: "Period",
                value:
                    filters.dateFrom || filters.dateTo
                        ? `${filters.dateFrom ? format(new Date(filters.dateFrom), "MMM d, yyyy") : "Start"} - ${filters.dateTo ? format(new Date(filters.dateTo), "MMM d, yyyy") : "Present"}`
                        : "All Time",
            },
        ];
        generateFiltersSummary(doc, filterLabels);

        // Calculate stats
        const dispensedCount = transactions.filter((t) => t.type === "dispensed").length;
        const stockInCount = transactions.filter((t) => t.type === "stock_in").length;
        const wastageCount = transactions.filter((t) => t.type === "wastage").length;

        generateStatsSummary(doc, [
            { label: "Total Transactions", value: transactions.length },
            { label: "Dispenses", value: dispensedCount },
            { label: "Stock Ins", value: stockInCount },
            { label: "Wastages", value: wastageCount },
        ]);

        // Define table columns
        const columns: TableColumn[] = [
            { header: "Date", key: "date", width: 12 },
            { header: "Time", key: "time", width: 10 },
            { header: "Employee", key: "employee", width: 18 },
            { header: "Type", key: "type", width: 12 },
            { header: "Medicine", key: "medicine", width: 20 },
            { header: "Qty", key: "quantity", width: 8, align: "center" },
            { header: "Details", key: "details", width: 20 },
        ];

        // Prepare table data
        const tableData = transactions.map((transaction) => ({
            date: format(new Date(transaction.createdAt), "dd/MM/yyyy"),
            time: format(new Date(transaction.createdAt), "hh:mm a"),
            employee: transaction.user.name,
            type: formatTransactionType(transaction.type),
            medicine: transaction.stockEntry.medicine.name,
            quantity:
                transaction.type === "stock_in"
                    ? `+${transaction.quantity}`
                    : `-${transaction.quantity}`,
            details: transaction.patient ?? transaction.reason ?? "-",
        }));

        // Generate table
        const totalPages = generateTable(doc, columns, tableData);

        // Generate footer on last page
        generateFooter(doc, totalPages);

        // Convert to base64
        const base64 = await pdfToBase64(doc);

        return {
            success: true,
            data: base64,
        };
    } catch (error) {
        console.error("Failed to generate employee activity report:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to generate report",
        };
    }
}

export async function generateRoleDistributionReport(
    filters: RoleDistributionFilters
) {
    try {
        await requirePermission("user", "list");

        // Build query filters
        const where: Record<string, unknown> = {};

        if (filters.status === "active") {
            where.banned = false;
        } else if (filters.status === "banned") {
            where.banned = true;
        }

        // Define role order and labels
        const roleConfig: { value: string; label: string }[] = [
            { value: "hr", label: "HR" },
            { value: "admin", label: "Admin" },
            { value: "inventory_manager", label: "Inventory Manager" },
            { value: "auditor", label: "Auditor" },
            { value: "user", label: "Pharmacist" },
        ];

        // Fetch all employees
        const employees = await prisma.user.findMany({
            where,
            select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                role: true,
                banned: true,
            },
            orderBy: { name: "asc" },
        });

        // Group employees by role
        const employeesByRole: Record<string, typeof employees> = {};
        for (const role of roleConfig) {
            employeesByRole[role.value] = employees.filter(
                (e) => e.role === role.value
            );
        }

        // Get facility settings
        const facility = await getFacilitySettings();

        // Create PDF document
        const doc = createPdfDocument();

        // Generate header
        generateHeader(
            doc,
            facility.name,
            facility.address,
            "Role Distribution Report"
        );

        // Generate filters summary
        const filterLabels = [
            {
                label: "Status",
                value:
                    filters.status === "all"
                        ? "All Employees"
                        : filters.status === "active"
                            ? "Active Only"
                            : "Banned Only",
            },
        ];
        generateFiltersSummary(doc, filterLabels);

        doc.moveDown(0.5);


        const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

        doc
            .fillColor(PDF_COLORS.primary)
            .fontSize(PDF_FONTS.heading)
            .font("Helvetica-Bold")
            .text("Role Summary", { width: pageWidth });

        doc.moveDown(0.5);

        // Draw summary box
        const summaryRowHeight = 20;
        const labelWidth = pageWidth * 0.7;
        const countWidth = pageWidth * 0.3;

        // Draw each role count
        for (const role of roleConfig) {
            const count = employeesByRole[role.value].length;
            const currentY = doc.y;

            // Role label
            doc
                .fillColor(PDF_COLORS.text)
                .fontSize(PDF_FONTS.body)
                .font("Helvetica")
                .text(role.label, PDF_MARGINS.left, currentY, {
                    width: labelWidth,
                });

            // Count (right aligned)
            doc
                .fillColor(PDF_COLORS.text)
                .fontSize(PDF_FONTS.body)
                .font("Helvetica-Bold")
                .text(count.toString(), PDF_MARGINS.left + labelWidth, currentY, {
                    width: countWidth,
                    align: "right",
                });

            doc.y = currentY + summaryRowHeight;
        }

        // Divider line
        doc
            .strokeColor(PDF_COLORS.border)
            .lineWidth(1)
            .moveTo(PDF_MARGINS.left, doc.y)
            .lineTo(PDF_MARGINS.left + pageWidth, doc.y)
            .stroke();

        doc.y += 5;

        // Total row
        const totalY = doc.y;
        doc
            .fillColor(PDF_COLORS.primary)
            .fontSize(PDF_FONTS.body)
            .font("Helvetica-Bold")
            .text("Total", PDF_MARGINS.left, totalY, {
                width: labelWidth,
            });

        doc
            .fillColor(PDF_COLORS.primary)
            .fontSize(PDF_FONTS.body)
            .font("Helvetica-Bold")
            .text(employees.length.toString(), PDF_MARGINS.left + labelWidth, totalY, {
                width: countWidth,
                align: "right",
            });

        doc.moveDown(2);

        // ==========================================
        // Section 2: Employee Listing by Role
        // ==========================================
        doc
            .fillColor(PDF_COLORS.primary)
            .fontSize(PDF_FONTS.heading)
            .font("Helvetica-Bold")
            .text("Employee Listing", { width: pageWidth });

        doc.moveDown(0.5);

        // Table configuration
        const columns: TableColumn[] = [
            { header: "Employee ID", key: "employeeId", width: 20 },
            { header: "Name", key: "name", width: 30 },
            { header: "Email", key: "email", width: 35 },
            { header: "Status", key: "status", width: 15, align: "center" },
        ];

        const columnWidths = columns.map((col) => (col.width / 100) * pageWidth);
        const xPositions: number[] = [];
        let currentX = PDF_MARGINS.left;
        for (const width of columnWidths) {
            xPositions.push(currentX);
            currentX += width;
        }

        const rowHeight = 25;
        let currentPage = 1;

        // Check if we need a new page
        const needsNewPage = (y: number, rows: number = 1) => {
            return y + rowHeight * rows > doc.page.height - PDF_MARGINS.bottom - 30;
        };

        // Draw table header
        const drawTableHeader = (y: number) => {
            // Header background
            doc
                .fillColor(PDF_COLORS.light)
                .rect(PDF_MARGINS.left, y, pageWidth, rowHeight)
                .fill();

            // Header text
            doc
                .fillColor(PDF_COLORS.primary)
                .fontSize(PDF_FONTS.small)
                .font("Helvetica-Bold");

            columns.forEach((col, i) => {
                doc.text(col.header, xPositions[i] + 5, y + 8, {
                    width: columnWidths[i] - 10,
                    align: col.align ?? "left",
                });
            });

            // Header border
            doc
                .strokeColor(PDF_COLORS.border)
                .lineWidth(0.5)
                .rect(PDF_MARGINS.left, y, pageWidth, rowHeight)
                .stroke();

            return y + rowHeight;
        };

        // Draw role group header
        const drawRoleHeader = (y: number, roleLabel: string) => {
            // Role header background
            doc
                .fillColor(PDF_COLORS.primary)
                .rect(PDF_MARGINS.left, y, pageWidth, rowHeight)
                .fill();

            // Role header text
            doc
                .fillColor(PDF_COLORS.white)
                .fontSize(PDF_FONTS.small)
                .font("Helvetica-Bold")
                .text(roleLabel.toUpperCase(), PDF_MARGINS.left + 5, y + 8, {
                    width: pageWidth - 10,
                    align: "center",
                });

            // Border
            doc
                .strokeColor(PDF_COLORS.border)
                .lineWidth(0.5)
                .rect(PDF_MARGINS.left, y, pageWidth, rowHeight)
                .stroke();

            return y + rowHeight;
        };

        // Draw employee row
        const drawEmployeeRow = (
            y: number,
            employee: {
                employeeId: string | null;
                name: string;
                email: string;
                banned: boolean;
            }
        ) => {
            doc
                .fillColor(PDF_COLORS.text)
                .fontSize(PDF_FONTS.small)
                .font("Helvetica");

            // Employee ID
            doc.text(employee.employeeId ?? "-", xPositions[0] + 5, y + 8, {
                width: columnWidths[0] - 10,
                align: "left",
            });

            // Name
            doc.text(employee.name, xPositions[1] + 5, y + 8, {
                width: columnWidths[1] - 10,
                align: "left",
            });

            // Email
            doc.text(employee.email, xPositions[2] + 5, y + 8, {
                width: columnWidths[2] - 10,
                align: "left",
            });

            // Status
            doc.text(employee.banned ? "Banned" : "Active", xPositions[3] + 5, y + 8, {
                width: columnWidths[3] - 10,
                align: "center",
            });

            // Row border
            doc
                .strokeColor(PDF_COLORS.border)
                .lineWidth(0.25)
                .rect(PDF_MARGINS.left, y, pageWidth, rowHeight)
                .stroke();

            return y + rowHeight;
        };

        // Draw table header first
        let currentY = drawTableHeader(doc.y);

        // Draw each role group
        for (const role of roleConfig) {
            const roleEmployees = employeesByRole[role.value];

            // Skip if no employees in this role
            if (roleEmployees.length === 0) continue;

            // Check if we need a new page for role header + at least one employee
            if (needsNewPage(currentY, 2)) {
                generateFooter(doc, currentPage);
                doc.addPage();
                currentPage++;
                currentY = PDF_MARGINS.top;
                currentY = drawTableHeader(currentY);
            }

            // Draw role header
            currentY = drawRoleHeader(currentY, role.label);

            // Draw employees
            for (const employee of roleEmployees) {
                if (needsNewPage(currentY)) {
                    generateFooter(doc, currentPage);
                    doc.addPage();
                    currentPage++;
                    currentY = PDF_MARGINS.top;
                    currentY = drawTableHeader(currentY);
                }

                currentY = drawEmployeeRow(currentY, employee);
            }
        }

        // Generate footer on last page
        generateFooter(doc, currentPage);

        // Convert to base64
        const base64 = await pdfToBase64(doc);

        return {
            success: true,
            data: base64,
        };
    } catch (error) {
        console.error("Failed to generate role distribution report:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to generate report",
        };
    }
}