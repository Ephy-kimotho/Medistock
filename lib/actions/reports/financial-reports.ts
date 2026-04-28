"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/check-permissions";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import {
    createPdfDocument,
    getFacilitySettings,
    generateHeader,
    generateFooter,
    generateFiltersSummary,
    generateStatsSummary,
    generateTable,
    pdfToBase64,
    PDF_MARGINS,
    PDF_COLORS,
    PDF_FONTS,
    type TableColumn,
} from "@/lib/services/pdf/utils";
import { drawSingleBarChart } from "@/lib/services/pdf/bar-chart";

export interface SalesReportFilters {
    paymentMethod: string;
    dateFrom: string | null;
    dateTo: string | null;
}

function truncateCode(code: string): string {
    if (code.length > 20) {
        return code.substring(0, 12) + "...";
    }
    return code;
}

export async function generateSalesReport(filters: SalesReportFilters) {
    try {
        await requirePermission("transaction", "read");

        // Default date range: last 4 months
        const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
        const dateFrom = filters.dateFrom
            ? new Date(filters.dateFrom)
            : subMonths(dateTo, 3);

        // Build date range filter for transactions
        const transactionWhere: Record<string, unknown> = {
            type: "dispensed",
            createdAt: {
                gte: startOfMonth(dateFrom),
                lte: endOfMonth(dateTo),
            },
        };

        // Fetch all dispense transactions with payment info
        const transactions = await prisma.transactions.findMany({
            where: transactionWhere,
            select: {
                id: true,
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
                payment: {
                    select: {
                        amount: true,
                        method: true,
                        paymentCode: true,
                    },
                },
                patientRecord: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Filter by payment method if specified
        let filteredTransactions = transactions;
        if (filters.paymentMethod !== "all") {
            filteredTransactions = transactions.filter(
                (t) => t.payment?.method === filters.paymentMethod
            );
        }

        // Get paid transactions only
        const paidTransactions = filteredTransactions.filter((t) => t.payment);

        // Generate all months in the range
        const months = eachMonthOfInterval({
            start: startOfMonth(dateFrom),
            end: endOfMonth(dateTo),
        });

        // Group paid transactions by month
        const monthlyData = months.map((monthDate) => {
            const monthKey = format(monthDate, "yyyy-MM");

            const monthTransactions = paidTransactions.filter(
                (t) => format(t.createdAt, "yyyy-MM") === monthKey
            );

            const total = monthTransactions.reduce(
                (sum, t) => sum + (t.payment?.amount || 0),
                0
            );

            return {
                label: format(monthDate, "MMM"),
                fullLabel: format(monthDate, "MMM yyyy"),
                total,
                transactionCount: monthTransactions.length,
            };
        });

        // Calculate revenue by payment method
        const revenueByMethod: Record<string, number> = {
            cash: 0,
            mpesa: 0,
            card: 0,
            insurance: 0,
        };

        for (const t of paidTransactions) {
            if (t.payment) {
                revenueByMethod[t.payment.method] += t.payment.amount;
            }
        }

        const totalRevenue = Object.values(revenueByMethod).reduce(
            (sum, val) => sum + val,
            0
        );

        // Calculate pending payments (transactions without payment)
        const pendingTransactions = filteredTransactions.filter((t) => !t.payment);
        const pendingCount = pendingTransactions.length;

        // Get facility settings
        const facility = await getFacilitySettings();

        // Create PDF document
        const doc = createPdfDocument();

        // Generate header
        generateHeader(doc, facility.name, facility.address, "Cash In Report");

        // Payment method label
        const methodLabels: Record<string, string> = {
            all: "All Methods",
            cash: "Cash",
            mpesa: "M-Pesa",
            card: "Card",
            insurance: "Insurance",
        };

        // Generate filters summary
        generateFiltersSummary(doc, [
            {
                label: "Period",
                value: `${format(dateFrom, "MMM d, yyyy")} - ${format(dateTo, "MMM d, yyyy")}`,
            },
            {
                label: "Payment Method",
                value: methodLabels[filters.paymentMethod] ?? "All Methods",
            },
        ]);

        // Generate stats summary
        generateStatsSummary(doc, [
            { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}` },
            { label: "Paid Transactions", value: paidTransactions.length },
            { label: "Pending Payments", value: pendingCount },
        ]);

        const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

        // Monthly Cash In Bar Chart
        drawSingleBarChart(
            doc,
            monthlyData.map((m) => ({ label: m.label, value: m.total })),
            {
                title: "Monthly Cash In",
                width: pageWidth,
                height: 250,
                color: "#22c55e",
                valuePrefix: "",
            }
        );

        // Monthly Breakdown Table
        doc.moveDown(1);
        doc
            .fontSize(PDF_FONTS.heading)
            .font("Helvetica-Bold")
            .fillColor(PDF_COLORS.primary)
            .text("Monthly Breakdown");
        doc.moveDown(0.5);

        const monthlyColumns: TableColumn[] = [
            { header: "Month", key: "fullLabel", width: 30 },
            { header: "Transactions", key: "transactionCount", width: 25, align: "center" },
            { header: "Revenue", key: "revenue", width: 45, align: "right" },
        ];

        const monthlyTableData = monthlyData.map((item) => ({
            fullLabel: item.fullLabel,
            transactionCount: item.transactionCount,
            revenue: `KES ${item.total.toLocaleString()}`,
        }));

        // Add totals row
        monthlyTableData.push({
            fullLabel: "TOTAL",
            transactionCount: paidTransactions.length,
            revenue: `KES ${totalRevenue.toLocaleString()}`,
        });

        generateTable(doc, monthlyColumns, monthlyTableData);


        // Revenue Summary Section

        doc.moveDown(1);
        doc
            .fillColor(PDF_COLORS.primary)
            .fontSize(PDF_FONTS.heading)
            .font("Helvetica-Bold")
            .text("Revenue by Payment Method", { width: pageWidth });

        doc.moveDown(0.5);

        const labelWidth = pageWidth * 0.6;
        const amountWidth = pageWidth * 0.4;

        // Revenue by method
        const methodOrder = [
            { key: "cash", label: "Cash" },
            { key: "mpesa", label: "M-Pesa" },
            { key: "card", label: "Card" },
            { key: "insurance", label: "Insurance" },
        ];

        for (const method of methodOrder) {
            const amount = revenueByMethod[method.key];
            const currentY = doc.y;

            doc
                .fillColor(PDF_COLORS.text)
                .fontSize(PDF_FONTS.body)
                .font("Helvetica")
                .text(method.label, PDF_MARGINS.left, currentY, {
                    width: labelWidth,
                });

            doc
                .fillColor(PDF_COLORS.text)
                .fontSize(PDF_FONTS.body)
                .font("Helvetica")
                .text(
                    `KES ${amount.toLocaleString()}`,
                    PDF_MARGINS.left + labelWidth,
                    currentY,
                    {
                        width: amountWidth,
                        align: "right",
                    }
                );

            doc.y = currentY + 20;
        }

        // Divider line
        doc
            .strokeColor(PDF_COLORS.border)
            .lineWidth(1)
            .moveTo(PDF_MARGINS.left, doc.y)
            .lineTo(PDF_MARGINS.left + pageWidth, doc.y)
            .stroke();

        doc.y += 8;

        // Total Revenue
        const totalY = doc.y;
        doc
            .fillColor(PDF_COLORS.primary)
            .fontSize(PDF_FONTS.body)
            .font("Helvetica-Bold")
            .text("Total Revenue", PDF_MARGINS.left, totalY, {
                width: labelWidth,
            });

        doc
            .fillColor(PDF_COLORS.primary)
            .fontSize(PDF_FONTS.body)
            .font("Helvetica-Bold")
            .text(
                `KES ${totalRevenue.toLocaleString()}`,
                PDF_MARGINS.left + labelWidth,
                totalY,
                {
                    width: amountWidth,
                    align: "right",
                }
            );

        doc.moveDown(2);


        // Payment Transactions Table
        doc
            .fillColor(PDF_COLORS.primary)
            .fontSize(PDF_FONTS.heading)
            .font("Helvetica-Bold")
            .text("Payment Transactions", { width: pageWidth });

        doc.moveDown(0.5);

        // Check if no paid transactions
        if (paidTransactions.length === 0) {
            doc.moveDown(1);
            doc
                .fillColor(PDF_COLORS.muted)
                .fontSize(PDF_FONTS.body)
                .font("Helvetica")
                .text("No payment transactions found for the selected criteria.", {
                    width: pageWidth,
                    align: "center",
                });

            generateFooter(doc, 1);
            const base64 = await pdfToBase64(doc);
            return { success: true, data: base64 };
        }

        // Define table columns
        const columns: TableColumn[] = [
            { header: "Date", key: "date", width: 12 },
            { header: "Patient", key: "patient", width: 20 },
            { header: "Medicine", key: "medicine", width: 22 },
            { header: "Method", key: "method", width: 12, align: "center" },
            { header: "Payment Code", key: "code", width: 18 },
            { header: "Amount", key: "amount", width: 16, align: "right" },
        ];

        // Prepare table data
        const tableData = paidTransactions.map((t) => ({
            date: format(new Date(t.createdAt), "dd/MM/yyyy"),
            patient: t.patientRecord?.name ?? "-",
            medicine: t.stockEntry.medicine.name,
            method: methodLabels[t.payment!.method] ?? t.payment!.method,
            code: truncateCode(t.payment!.paymentCode),
            amount: `KES ${t.payment!.amount.toLocaleString()}`,
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
        console.error("Failed to generate sales report:", error);
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to generate report",
        };
    }
}