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
    PDF_MARGINS,
    PDF_COLORS,
    PDF_FONTS,
    type TableColumn,
} from "@/lib/services/pdf/utils";


export interface SalesReportFilters {
    paymentMethod: string;
    dateFrom: string | null;
    dateTo: string | null;
}

function truncateCode(code: string): string {
    if (code.length > 15) {
        return code.substring(0, 12) + "...";
    }
    return code;
}

export async function generateSalesReport(
    filters: SalesReportFilters
) {
    try {
        await requirePermission("transaction", "read");

        // Build date range filter for transactions
        const transactionWhere: Record<string, unknown> = {
            type: "dispensed",
        };

        if (filters.dateFrom || filters.dateTo) {
            transactionWhere.createdAt = {};
            if (filters.dateFrom) {
                (transactionWhere.createdAt as Record<string, Date>).gte = new Date(
                    filters.dateFrom
                );
            }
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                (transactionWhere.createdAt as Record<string, Date>).lte = toDate;
            }
        }

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
                        name: true
                    }
                }
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

        // Get paid transactions only for the table
        const paidTransactions = filteredTransactions.filter((t) => t.payment);

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
        const pendingTransactions = transactions.filter((t) => !t.payment);
        const pendingCount = pendingTransactions.length;

        // Get facility settings
        const facility = await getFacilitySettings();

        // Create PDF document
        const doc = createPdfDocument();

        // Generate header
        generateHeader(
            doc,
            facility.name,
            facility.address,
            "Sales/Payment Report"
        );

        // Payment method label
        const methodLabels: Record<string, string> = {
            all: "All Methods",
            cash: "Cash",
            mpesa: "M-Pesa",
            card: "Card",
            insurance: "Insurance",
        };

        // Generate filters summary
        const filterLabels = [
            {
                label: "Period",
                value:
                    filters.dateFrom || filters.dateTo
                        ? `${filters.dateFrom ? format(new Date(filters.dateFrom), "MMM d, yyyy") : "Start"} - ${filters.dateTo ? format(new Date(filters.dateTo), "MMM d, yyyy") : "Present"}`
                        : "All Time",
            },
            {
                label: "Payment Method",
                value: methodLabels[filters.paymentMethod] ?? "All Methods",
            },
        ];
        generateFiltersSummary(doc, filterLabels);

        // Generate stats summary
        generateStatsSummary(doc, [
            { label: "Total Transactions", value: transactions.length },
            { label: "Paid", value: paidTransactions.length },
            { label: "Pending", value: pendingCount },
        ]);

        const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

        // ==========================================
        // Revenue Summary Section
        // ==========================================
        doc
            .fillColor(PDF_COLORS.primary)
            .fontSize(PDF_FONTS.heading)
            .font("Helvetica-Bold")
            .text("Revenue Summary", { width: pageWidth });

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

        // ==========================================
        // Payment Transactions Table
        // ==========================================
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


