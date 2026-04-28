"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/check-permissions";
import {
  createPdfDocument,
  getFacilitySettings,
  generateHeader,
  generateFooter,
  generateFiltersSummary,
  generateStatsSummary,
  generateTable,
  pdfToBase64,
  PDF_COLORS,
  PDF_FONTS,
  PDF_MARGINS,
  type TableColumn,
} from "@/lib/services/pdf/utils";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  eachMonthOfInterval,
  addDays, isBefore, differenceInDays
} from "date-fns";
import { drawBarChart } from "@/lib/services/pdf/bar-chart";

// Interface definitions
export interface CategoryOption {
  id: string;
  name: string;
}

export interface StockLevelFilters {
  medicineId: string;
  categoryId?: string;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface LowStockFilters {
  categoryId: string;
}

export interface ExpiryFilters {
  categoryId: string;
  expiryPeriod: string;
}

export interface DispensingFilters {
  categoryId: string;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface WastageReportFilters {
  categoryId: string;
  reason: string;
  dateFrom: string | null;
  dateTo: string | null;
}

// Utility function definition
function truncateNotes(notes: string | null): string {
  if (!notes) return "-";
  if (notes.length > 20) {
    return notes.substring(0, 17) + "...";
  }
  return notes;
}

// Generate report server actions
export async function getCategoriesForReport() {
  try {
    await requirePermission("medicine", "read");

    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    console.error("Failed to get categories for report:", error);
    return [];
  }
}

export async function getMedicinesForReport() {
  try {
    const medicines = await prisma.medicines.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: medicines };
  } catch (error) {
    console.error("Failed to fetch medicines for report:", error);
    return { success: false, message: "Failed to fetch medicines" };
  }
}

export async function generateStockLevelReport(filters: StockLevelFilters) {
  try {
    await requirePermission("medicine", "read");

    // Default date range: last 3 months
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    const dateFrom = filters.dateFrom
      ? new Date(filters.dateFrom)
      : subMonths(dateTo, 3);

    const isAllMedicines = filters.medicineId === "all";
    const isAllCategories = filters.categoryId === "all";

    // Variables for report content
    let medicineName: string;
    let categoryName: string;
    let unit: string;

    if (isAllMedicines) {
      medicineName = "All Medicines";
      unit = "units";

      if (isAllCategories) {
        categoryName = "All Categories";
      } else {
        // Fetch specific category name
        const category = await prisma.category.findUnique({
          where: { id: filters.categoryId },
          select: { name: true },
        });

        if (!category) {
          return { success: false, message: "Category not found" };
        }

        categoryName = category.name;
      }
    } else {
      // Fetch the specific medicine details
      const medicine = await prisma.medicines.findUnique({
        where: { id: filters.medicineId },
        select: {
          id: true,
          name: true,
          unit: true,
          category: { select: { name: true } },
        },
      });

      if (!medicine) {
        return { success: false, message: "Medicine not found" };
      }

      medicineName = medicine.name;
      categoryName = medicine.category.name;
      unit = medicine.unit;
    }

    // Build transaction query
    const transactionWhere: Record<string, unknown> = {
      createdAt: {
        gte: startOfMonth(dateFrom),
        lte: endOfMonth(dateTo),
      },
      type: { in: ["stock_in", "dispensed", "wastage"] },
    };

    // Add filters based on selection
    if (!isAllMedicines) {
      // Specific medicine
      transactionWhere.stockEntry = {
        medicineId: filters.medicineId,
      };
    } else if (!isAllCategories) {
      // All medicines in a specific category
      transactionWhere.stockEntry = {
        medicine: {
          categoryId: filters.categoryId,
        },
      };
    }
    // If both are "all", no additional filter needed

    // Fetch transactions
    const transactions = await prisma.transactions.findMany({
      where: transactionWhere,
      select: {
        type: true,
        quantity: true,
        createdAt: true,
      },
    });

    // Generate all months in the range
    const months = eachMonthOfInterval({
      start: startOfMonth(dateFrom),
      end: endOfMonth(dateTo),
    });

    // Group transactions by month
    const monthlyData = months.map((monthDate) => {
      const monthKey = format(monthDate, "yyyy-MM");

      const monthTransactions = transactions.filter(
        (t) => format(t.createdAt, "yyyy-MM") === monthKey
      );

      const stockIn = monthTransactions
        .filter((t) => t.type === "stock_in")
        .reduce((sum, t) => sum + t.quantity, 0);

      const stockOut = monthTransactions
        .filter((t) => t.type === "dispensed" || t.type === "wastage")
        .reduce((sum, t) => sum + t.quantity, 0);

      return {
        label: format(monthDate, "MMM"),
        fullLabel: format(monthDate, "MMM yyyy"),
        stockIn,
        stockOut,
      };
    });

    // Calculate totals for summary
    const totalStockIn = monthlyData.reduce((sum, m) => sum + m.stockIn, 0);
    const totalStockOut = monthlyData.reduce((sum, m) => sum + m.stockOut, 0);

    // Get facility settings
    const facility = await getFacilitySettings();

    // Create PDF document
    const doc = createPdfDocument();

    // Generate header
    generateHeader(doc, facility.name, facility.address, "Stock Level Report");

    // Generate filters summary
    generateFiltersSummary(doc, [
      { label: "Medicine", value: medicineName },
      { label: "Category", value: categoryName },
      {
        label: "Period",
        value: `${format(dateFrom, "MMM d, yyyy")} - ${format(dateTo, "MMM d, yyyy")}`,
      },
    ]);

    // Generate stats summary
    generateStatsSummary(doc, [
      { label: "Total Stock In", value: `${totalStockIn} ${unit}` },
      { label: "Total Stock Out", value: `${totalStockOut} ${unit}` },
      {
        label: "Net Change",
        value: `${totalStockIn - totalStockOut >= 0 ? "+" : ""}${totalStockIn - totalStockOut} ${unit}`,
      },
    ]);

    // Draw bar chart
    const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

    // Chart title based on selection
    let chartTitle = `Stock Movement - ${medicineName}`;
    if (isAllMedicines && !isAllCategories) {
      chartTitle = `Stock Movement - ${categoryName}`;
    }

    drawBarChart(doc, monthlyData, {
      title: chartTitle,
      width: pageWidth,
      height: 280,
      colors: {
        stockIn: "#22c55e",
        stockOut: "#f97316",
      },
    });

    // Add monthly breakdown table below chart
    doc.moveDown(1);
    doc
      .fontSize(PDF_FONTS.heading)
      .font("Helvetica-Bold")
      .fillColor(PDF_COLORS.primary)
      .text("Monthly Breakdown");
    doc.moveDown(0.5);

    const columns: TableColumn[] = [
      { header: "Month", key: "fullLabel", width: 25 },
      { header: "Stock In", key: "stockIn", width: 25, align: "center" },
      { header: "Stock Out", key: "stockOut", width: 25, align: "center" },
      { header: "Net Change", key: "netChange", width: 25, align: "center" },
    ];

    const tableData = monthlyData.map((item) => ({
      fullLabel: item.fullLabel,
      stockIn: item.stockIn,
      stockOut: item.stockOut,
      netChange:
        item.stockIn - item.stockOut >= 0
          ? `+${item.stockIn - item.stockOut}`
          : `${item.stockIn - item.stockOut}`,
    }));

    // Add totals row
    tableData.push({
      fullLabel: "TOTAL",
      stockIn: totalStockIn,
      stockOut: totalStockOut,
      netChange:
        totalStockIn - totalStockOut >= 0
          ? `+${totalStockIn - totalStockOut}`
          : `${totalStockIn - totalStockOut}`,
    });

    const totalPages = generateTable(doc, columns, tableData);

    // Generate footer
    generateFooter(doc, totalPages);

    // Convert to base64
    const base64 = await pdfToBase64(doc);

    return {
      success: true,
      data: base64,
    };
  } catch (error) {
    console.error("Failed to generate stock level report:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

export async function generateLowStockReport(filters: LowStockFilters) {
  try {
    await requirePermission("medicine", "read");

    // Build query filters
    const where: Record<string, unknown> = {
      isActive: true,
      deletedAt: null,
    };

    if (filters.categoryId !== "all") {
      where.categoryId = filters.categoryId;
    }

    // Fetch medicines with stock entries
    const medicines = await prisma.medicines.findMany({
      where,
      select: {
        id: true,
        name: true,
        unit: true,
        reorderlevel: true,
        category: {
          select: {
            name: true,
          },
        },
        stockEntries: {
          where: {
            quantity: { gt: 0 },
          },
          select: {
            quantity: true,
          },
        },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    });

    // Filter to only low stock items (stock <= reorder level)
    const lowStockData = medicines
      .map((medicine) => {
        const totalStock = medicine.stockEntries.reduce(
          (sum, entry) => sum + entry.quantity,
          0,
        );

        const deficit = medicine.reorderlevel - totalStock;

        return {
          id: medicine.id,
          name: medicine.name,
          category: medicine.category.name,
          unit: medicine.unit,
          totalStock,
          reorderLevel: medicine.reorderlevel,
          deficit: deficit > 0 ? deficit : 0,
          isOutOfStock: totalStock === 0,
        };
      })
      .filter((item) => item.totalStock <= item.reorderLevel)
      .sort((a, b) => {
        // Sort by out of stock first, then by deficit (highest first)
        if (a.isOutOfStock !== b.isOutOfStock) {
          return a.isOutOfStock ? -1 : 1;
        }
        return b.deficit - a.deficit;
      });

    // Get category name for filter display
    let categoryName = "All Categories";
    if (filters.categoryId !== "all") {
      const category = await prisma.category.findUnique({
        where: { id: filters.categoryId },
        select: { name: true },
      });
      categoryName = category?.name ?? "Unknown";
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
      "Low Stock Alert Report",
    );

    // Generate filters summary
    generateFiltersSummary(doc, [{ label: "Category", value: categoryName }]);

    // Calculate summary stats
    const outOfStockCount = lowStockData.filter(
      (item) => item.isOutOfStock,
    ).length;
    const lowStockCount = lowStockData.filter(
      (item) => !item.isOutOfStock,
    ).length;
    const totalDeficit = lowStockData.reduce(
      (sum, item) => sum + item.deficit,
      0,
    );

    generateStatsSummary(doc, [
      { label: "Total Items Below Threshold", value: lowStockData.length },
      { label: "Out of Stock", value: outOfStockCount },
      { label: "Low Stock", value: lowStockCount },
      { label: "Total Units Needed", value: totalDeficit },
    ]);

    // Check if no low stock items
    if (lowStockData.length === 0) {
      const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

      doc.moveDown(2);
      doc
        .fillColor(PDF_COLORS.primary)
        .fontSize(PDF_FONTS.heading)
        .font("Helvetica-Bold")
        .text("All stock levels are healthy!", {
          width: pageWidth,
          align: "center",
        });

      doc.moveDown(0.5);
      doc
        .fillColor(PDF_COLORS.muted)
        .fontSize(PDF_FONTS.body)
        .font("Helvetica")
        .text("No medicines are currently below their reorder level.", {
          width: pageWidth,
          align: "center",
        });

      generateFooter(doc, 1);
      const base64 = await pdfToBase64(doc);
      return { success: true, data: base64 };
    }

    // Define table columns
    const columns: TableColumn[] = [
      { header: "Medicine", key: "name", width: 25 },
      { header: "Category", key: "category", width: 20 },
      {
        header: "Current Stock",
        key: "totalStock",
        width: 15,
        align: "center",
      },
      { header: "Unit", key: "unit", width: 10, align: "center" },
      {
        header: "Reorder Level",
        key: "reorderLevel",
        width: 15,
        align: "center",
      },
      { header: "Units Needed", key: "deficit", width: 15, align: "center" },
    ];

    // Prepare table data
    const tableData = lowStockData.map((item) => ({
      name: item.name,
      category: item.category,
      totalStock: item.isOutOfStock ? "OUT" : item.totalStock,
      unit: item.unit,
      reorderLevel: item.reorderLevel,
      deficit: item.deficit,
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
    console.error("Failed to generate low stock report:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

export async function generateExpiryReport(filters: ExpiryFilters) {
  try {
    await requirePermission("medicine", "read");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build date filters based on expiry period
    let expiryDateFilter: Record<string, Date> = {};
    let periodLabel = "All Time";

    switch (filters.expiryPeriod) {
      case "expired":
        expiryDateFilter = { lt: today };
        periodLabel = "Already Expired";
        break;
      case "30":
        expiryDateFilter = { gte: today, lte: addDays(today, 30) };
        periodLabel = "Expiring in 30 Days";
        break;
      case "60":
        expiryDateFilter = { gte: today, lte: addDays(today, 60) };
        periodLabel = "Expiring in 60 Days";
        break;
      case "90":
        expiryDateFilter = { gte: today, lte: addDays(today, 90) };
        periodLabel = "Expiring in 90 Days";
        break;
      case "all":
      default:
        // Include expired + expiring in 90 days
        expiryDateFilter = { lte: addDays(today, 90) };
        periodLabel = "Expired + Expiring in 90 Days";
        break;
    }

    // Build medicine filter
    const medicineWhere: Record<string, unknown> = {
      isActive: true,
      deletedAt: null,
    };

    if (filters.categoryId !== "all") {
      medicineWhere.categoryId = filters.categoryId;
    }

    // Fetch stock entries with expiry info
    const stockEntries = await prisma.stockEntries.findMany({
      where: {
        quantity: { gt: 0 },
        expiryDate: expiryDateFilter,
        medicine: medicineWhere,
      },
      select: {
        id: true,
        batchNumber: true,
        quantity: true,
        expiryDate: true,
        medicine: {
          select: {
            name: true,
            unit: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { expiryDate: "asc" },
    });

    // Process stock entries
    const expiryData = stockEntries.map((entry) => {
      const expiryDate = new Date(entry.expiryDate);
      const isExpired = isBefore(expiryDate, today);
      const daysUntilExpiry = differenceInDays(expiryDate, today);

      let status: string;
      if (isExpired) {
        status = "Expired";
      } else if (daysUntilExpiry <= 30) {
        status = "Critical";
      } else if (daysUntilExpiry <= 60) {
        status = "Warning";
      } else {
        status = "Expiring Soon";
      }

      return {
        id: entry.id,
        medicineName: entry.medicine.name,
        category: entry.medicine.category.name,
        batchNumber: entry.batchNumber,
        quantity: entry.quantity,
        unit: entry.medicine.unit,
        expiryDate: entry.expiryDate,
        daysUntilExpiry,
        isExpired,
        status,
      };
    });

    // Get category name for filter display
    let categoryName = "All Categories";
    if (filters.categoryId !== "all") {
      const category = await prisma.category.findUnique({
        where: { id: filters.categoryId },
        select: { name: true },
      });
      categoryName = category?.name ?? "Unknown";
    }

    // Get facility settings
    const facility = await getFacilitySettings();

    // Create PDF document
    const doc = createPdfDocument();

    // Generate header
    generateHeader(doc, facility.name, facility.address, "Expiry Report");

    // Generate filters summary
    generateFiltersSummary(doc, [
      { label: "Category", value: categoryName },
      { label: "Period", value: periodLabel },
    ]);


    // Check if no expiry items
    if (expiryData.length === 0) {
      const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

      doc.moveDown(2);
      doc
        .fillColor(PDF_COLORS.primary)
        .fontSize(PDF_FONTS.heading)
        .font("Helvetica-Bold")
        .text("No expiring batches found!", {
          width: pageWidth,
          align: "center",
        });

      doc.moveDown(0.5);
      doc
        .fillColor(PDF_COLORS.muted)
        .fontSize(PDF_FONTS.body)
        .font("Helvetica")
        .text("No batches match the selected expiry criteria.", {
          width: pageWidth,
          align: "center",
        });

      generateFooter(doc, 1);
      const base64 = await pdfToBase64(doc);
      return { success: true, data: base64 };
    }

    // Define table columns
    const columns: TableColumn[] = [
      { header: "Medicine", key: "medicineName", width: 22 },
      { header: "Category", key: "category", width: 15 },
      { header: "Batch", key: "batchNumber", width: 15 },
      { header: "Qty", key: "quantity", width: 8, align: "center" },
      { header: "Unit", key: "unit", width: 8, align: "center" },
      { header: "Expiry Date", key: "expiryDate", width: 14, align: "center" },
      { header: "Days Left", key: "daysLeft", width: 10, align: "center" },
      { header: "Status", key: "status", width: 8, align: "center" },
    ];

    // Prepare table data
    const tableData = expiryData.map((item) => ({
      medicineName: item.medicineName,
      category: item.category,
      batchNumber: item.batchNumber,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: format(new Date(item.expiryDate), "dd/MM/yyyy"),
      daysLeft: item.isExpired
        ? `${Math.abs(item.daysUntilExpiry)}d ago`
        : `${item.daysUntilExpiry}d`,
      status: item.status,
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
    console.error("Failed to generate expiry report:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

export async function generateDispensingReport(filters: DispensingFilters) {
  try {
    await requirePermission("transaction", "read");

    // Build query filters
    const where: Record<string, unknown> = {
      type: "dispensed",
    };

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(
          filters.dateFrom,
        );
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, Date>).lte = toDate;
      }
    }

    // Category filter via stock entry -> medicine
    if (filters.categoryId !== "all") {
      where.stockEntry = {
        medicine: {
          categoryId: filters.categoryId,
        },
      };
    }

    // Fetch dispense transactions
    const transactions = await prisma.transactions.findMany({
      where,
      select: {
        id: true,
        quantity: true,
        notes: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
        stockEntry: {
          select: {
            batchNumber: true,
            medicine: {
              select: {
                name: true,
                unit: true,
                ageGroup: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        payment: {
          select: {
            amount: true,
            method: true,
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

    // Get category name for filter display
    let categoryName = "All Categories";
    if (filters.categoryId !== "all") {
      const category = await prisma.category.findUnique({
        where: { id: filters.categoryId },
        select: { name: true },
      });
      categoryName = category?.name ?? "Unknown";
    }

    // Get facility settings
    const facility = await getFacilitySettings();

    // Create PDF document
    const doc = createPdfDocument();

    // Generate header
    generateHeader(doc, facility.name, facility.address, "Dispensing Report");

    // Generate filters summary
    const filterLabels = [
      { label: "Category", value: categoryName },
      {
        label: "Period",
        value:
          filters.dateFrom || filters.dateTo
            ? `${filters.dateFrom ? format(new Date(filters.dateFrom), "MMM d, yyyy") : "Start"} - ${filters.dateTo ? format(new Date(filters.dateTo), "MMM d, yyyy") : "Present"}`
            : "All Time",
      },
    ];
    generateFiltersSummary(doc, filterLabels);

    // Calculate summary stats
    const totalDispenses = transactions.length;
    const totalUnits = transactions.reduce((sum, t) => sum + t.quantity, 0);
    const paidTransactions = transactions.filter((t) => t.payment);
    const pendingPayments = transactions.filter((t) => !t.payment).length;

    // Age group breakdown
    const ageGroupCounts: Record<string, number> = {};
    for (const t of transactions) {
      const ageGroup = t.stockEntry.medicine.ageGroup ?? "Unspecified";
      ageGroupCounts[ageGroup] = (ageGroupCounts[ageGroup] ?? 0) + 1;
    }

    generateStatsSummary(doc, [
      { label: "Total Dispenses", value: totalDispenses },
      { label: "Total Units", value: totalUnits },
      { label: "Paid", value: paidTransactions.length },
      { label: "Pending Payment", value: pendingPayments },
    ]);

    // Check if no transactions
    if (transactions.length === 0) {
      const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

      doc.moveDown(2);
      doc
        .fillColor(PDF_COLORS.primary)
        .fontSize(PDF_FONTS.heading)
        .font("Helvetica-Bold")
        .text("No dispenses found!", {
          width: pageWidth,
          align: "center",
        });

      doc.moveDown(0.5);
      doc
        .fillColor(PDF_COLORS.muted)
        .fontSize(PDF_FONTS.body)
        .font("Helvetica")
        .text("No dispense transactions match the selected criteria.", {
          width: pageWidth,
          align: "center",
        });

      generateFooter(doc, 1);
      const base64 = await pdfToBase64(doc);
      return { success: true, data: base64 };
    }

    // Age Group Summary Section
    const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

    doc
      .fillColor(PDF_COLORS.primary)
      .fontSize(PDF_FONTS.heading)
      .font("Helvetica-Bold")
      .text("Patient Demographics (by Age Group)", { width: pageWidth });

    doc.moveDown(0.5);

    const ageGroupLabels: Record<string, string> = {
      infant: "Infant < 1 year",
      pediatric: "Pediatric (1-17 years)",
      adult: "Adult (18-64 years)",
      geriatric: "Elderly (65+ years)",
      all_ages: "All ages"
    };

    for (const [group, count] of Object.entries(ageGroupCounts)) {
      const labelWidth = pageWidth * 0.7;
      const countWidth = pageWidth * 0.3;
      const currentY = doc.y;

      doc
        .fillColor(PDF_COLORS.text)
        .fontSize(PDF_FONTS.body)
        .font("Helvetica")
        .text(ageGroupLabels[group] ?? group, PDF_MARGINS.left, currentY, {
          width: labelWidth,
        });

      doc
        .fillColor(PDF_COLORS.text)
        .fontSize(PDF_FONTS.body)
        .font("Helvetica-Bold")
        .text(count.toString(), PDF_MARGINS.left + labelWidth, currentY, {
          width: countWidth,
          align: "right",
        });

      doc.y = currentY + 18;
    }

    doc.moveDown(1.5);

    // Dispense Transactions Table
    doc
      .fillColor(PDF_COLORS.primary)
      .fontSize(PDF_FONTS.heading)
      .font("Helvetica-Bold")
      .text("Dispense Transactions", { width: pageWidth });

    doc.moveDown(0.5);

    // Define table columns
    const columns: TableColumn[] = [
      { header: "Date", key: "date", width: 12 },
      { header: "Patient", key: "patient", width: 18 },
      { header: "Medicine", key: "medicine", width: 18 },
      { header: "Batch", key: "batch", width: 12 },
      { header: "Qty", key: "quantity", width: 7, align: "center" },
      { header: "Dosage", key: "dosage", width: 15 },
      { header: "Dispensed By", key: "dispensedBy", width: 18 },
    ];

    // Prepare table data
    const tableData = transactions.map((t) => ({
      date: format(new Date(t.createdAt), "dd/MM/yyyy"),
      patient: t.patientRecord?.name ?? "-",
      medicine: t.stockEntry.medicine.name,
      batch: t.stockEntry.batchNumber,
      quantity: t.quantity,
      dosage: t.notes ?? "-",
      dispensedBy: t.user.name,
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
    console.error("Failed to generate dispensing report:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

export async function generateWastageReport(
  filters: WastageReportFilters
) {
  try {
    await requirePermission("transaction", "read");

    // Build query filters
    const where: Record<string, unknown> = {
      type: "wastage",
    };

    // Reason filter
    if (filters.reason !== "all") {
      where.reason = filters.reason;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(
          filters.dateFrom
        );
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, Date>).lte = toDate;
      }
    }

    // Category filter via stock entry -> medicine
    if (filters.categoryId !== "all") {
      where.stockEntry = {
        medicine: {
          categoryId: filters.categoryId,
        },
      };
    }

    // Fetch wastage transactions
    const transactions = await prisma.transactions.findMany({
      where,
      select: {
        id: true,
        quantity: true,
        reason: true,
        notes: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
        stockEntry: {
          select: {
            batchNumber: true,
            medicine: {
              select: {
                name: true,
                unit: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate wastage by reason
    const wastageByReason: Record<string, number> = {
      expired: 0,
      spillage: 0,
      damage: 0,
      recalled: 0,
      other: 0,
    };

    for (const t of transactions) {
      const reason = t.reason ?? "other";
      if (wastageByReason[reason] !== undefined) {
        wastageByReason[reason] += t.quantity;
      } else {
        wastageByReason["other"] += t.quantity;
      }
    }

    const totalUnitsLost = Object.values(wastageByReason).reduce(
      (sum, val) => sum + val,
      0
    );

    // Get category name for filter display
    let categoryName = "All Categories";
    if (filters.categoryId !== "all") {
      const category = await prisma.category.findUnique({
        where: { id: filters.categoryId },
        select: { name: true },
      });
      categoryName = category?.name ?? "Unknown";
    }

    // Reason labels
    const reasonLabels: Record<string, string> = {
      all: "All Reasons",
      expired: "Expired",
      recalled: "Recalled",
      spillage: "Spillage",
      damage: "Damage",
      other: "Other",
    };

    // Get facility settings
    const facility = await getFacilitySettings();

    // Create PDF document
    const doc = createPdfDocument();

    // Generate header
    generateHeader(doc, facility.name, facility.address, "Wastage Report");

    // Generate filters summary
    const filterLabels = [
      { label: "Category", value: categoryName },
      { label: "Reason", value: reasonLabels[filters.reason] ?? "All Reasons" },
      {
        label: "Period",
        value:
          filters.dateFrom || filters.dateTo
            ? `${filters.dateFrom ? format(new Date(filters.dateFrom), "MMM d, yyyy") : "Start"} - ${filters.dateTo ? format(new Date(filters.dateTo), "MMM d, yyyy") : "Present"}`
            : "All Time",
      },
    ];
    generateFiltersSummary(doc, filterLabels);

    // Generate stats summary
    generateStatsSummary(doc, [
      { label: "Total Wastage Entries", value: transactions.length },
      { label: "Total Units Lost", value: totalUnitsLost },
    ]);

    const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

    // Wastage Transactions Table

    doc
      .fillColor(PDF_COLORS.primary)
      .fontSize(PDF_FONTS.heading)
      .font("Helvetica-Bold")
      .text("Wastage Transactions", { width: pageWidth });

    doc.moveDown(0.5);

    // Check if no transactions
    if (transactions.length === 0) {
      doc.moveDown(1);
      doc
        .fillColor(PDF_COLORS.muted)
        .fontSize(PDF_FONTS.body)
        .font("Helvetica")
        .text("No wastage transactions found for the selected criteria.", {
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
      { header: "Medicine", key: "medicine", width: 20 },
      { header: "Batch", key: "batch", width: 14 },
      { header: "Reason", key: "reason", width: 12, align: "center" },
      { header: "Qty", key: "quantity", width: 8, align: "center" },
      { header: "Notes", key: "notes", width: 18 },
      { header: "Recorded By", key: "recordedBy", width: 16 },
    ];

    // Prepare table data
    const tableData = transactions.map((t) => ({
      date: format(new Date(t.createdAt), "dd/MM/yyyy"),
      medicine: t.stockEntry.medicine.name,
      batch: t.stockEntry.batchNumber,
      reason: reasonLabels[t.reason ?? "other"] ?? t.reason,
      quantity: t.quantity,
      notes: truncateNotes(t.notes),
      recordedBy: t.user.name,
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
    console.error("Failed to generate wastage report:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}