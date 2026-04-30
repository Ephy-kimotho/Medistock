import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

// Color palette (blue shades matching existing employee card)
export const PDF_COLORS = {
  primary: "#0077B6",
  secondary: "#3b82f6",
  light: "#dbeafe",
  text: "#1e293b",
  muted: "#64748b",
  border: "#cbd5e1",
  white: "#FFFFFF",
  black: "#000000",
  lightGray: "#F5F5F5",
  gray: "#666666",
};

// Font sizes
export const PDF_FONTS = {
  title: 20,
  subtitle: 14,
  heading: 12,
  body: 10,
  small: 8,
};

// Page margins
export const PDF_MARGINS = {
  top: 50,
  bottom: 50,
  left: 25,
  right: 25,
};

// Get facility settings
export async function getFacilitySettings() {
  const settings = await prisma.settings.findFirst();
  return {
    name: settings?.facilityName ?? "MediStock",
    address: settings?.facilityAddress ?? "",
  };
}

// Create new PDF document with standard settings
export function createPdfDocument() {
  return new PDFDocument({
    size: "A4",
    margins: {
      top: PDF_MARGINS.top,
      bottom: PDF_MARGINS.bottom,
      left: PDF_MARGINS.left,
      right: PDF_MARGINS.right,
    },
    bufferPages: true,
  });
}

// Generate PDF header with facility branding
export function generateHeader(
  doc: PDFKit.PDFDocument,
  facilityName: string,
  facilityAddress: string,
  reportTitle: string
) {
  const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

  // Facility name
  doc
    .fillColor(PDF_COLORS.primary)
    .fontSize(PDF_FONTS.title)
    .font("Helvetica-Bold")
    .text(facilityName.toUpperCase(), PDF_MARGINS.left, PDF_MARGINS.top, {
      width: pageWidth,
    });

  // Facility address
  if (facilityAddress) {
    doc
      .fillColor(PDF_COLORS.muted)
      .fontSize(PDF_FONTS.small)
      .font("Helvetica")
      .text(facilityAddress, { width: pageWidth });
  }

  // Generated date (right aligned)
  const generatedText = `Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`;
  doc
    .fillColor(PDF_COLORS.muted)
    .fontSize(PDF_FONTS.small)
    .text(generatedText, PDF_MARGINS.left, PDF_MARGINS.top, {
      width: pageWidth,
      align: "right",
    });

  // Divider line
  const currentY = doc.y + 10;
  doc
    .strokeColor(PDF_COLORS.border)
    .lineWidth(1)
    .moveTo(PDF_MARGINS.left, currentY)
    .lineTo(doc.page.width - PDF_MARGINS.right, currentY)
    .stroke();

  // Report title
  doc
    .fillColor(PDF_COLORS.primary)
    .fontSize(PDF_FONTS.subtitle)
    .font("Helvetica-Bold")
    .text(reportTitle.toUpperCase(), PDF_MARGINS.left, currentY + 15, {
      width: pageWidth,
    });

  doc.moveDown(0.5);
}

// Generate PDF footer with page numbers
export function generateFooter(doc: PDFKit.PDFDocument, pageNumber: number) {
  const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;
  const footerY = doc.page.height - PDF_MARGINS.bottom + 20;

  // Divider line
  doc
    .strokeColor(PDF_COLORS.border)
    .lineWidth(0.5)
    .moveTo(PDF_MARGINS.left, footerY - 10)
    .lineTo(doc.page.width - PDF_MARGINS.right, footerY - 10)
    .stroke();

  // Page number
  doc
    .fillColor(PDF_COLORS.muted)
    .fontSize(PDF_FONTS.small)
    .font("Helvetica")
    .text(`Page ${pageNumber}`, PDF_MARGINS.left, footerY, {
      width: pageWidth,
      align: "center",
    });
}

// Generate filters summary section
export function generateFiltersSummary(
  doc: PDFKit.PDFDocument,
  filters: { label: string; value: string }[]
) {
  const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

  doc
    .fillColor(PDF_COLORS.muted)
    .fontSize(PDF_FONTS.small)
    .font("Helvetica")
    .text(
      "Filters Applied: " +
      filters.map((f) => `${f.label}: ${f.value}`).join(" | "),
      PDF_MARGINS.left,
      doc.y,
      { width: pageWidth }
    );

  doc.moveDown(0.5);
}

// Generate summary stats row
export function generateStatsSummary(
  doc: PDFKit.PDFDocument,
  stats: { label: string; value: string | number }[]
) {
  const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;

  doc
    .fillColor(PDF_COLORS.text)
    .fontSize(PDF_FONTS.body)
    .font("Helvetica-Bold")
    .text(
      stats.map((s) => `${s.label}: ${s.value}`).join(" | "),
      PDF_MARGINS.left,
      doc.y,
      { width: pageWidth }
    );

  doc.moveDown(1);
}

// ==================== SECTION TITLE HELPER ====================

/**
 * Renders a section title (e.g. "Staff Performance") with proper positioning.
 *
 * Fixes two issues:
 * 1. Always resets doc.x to PDF_MARGINS.left so titles never drift right
 *    after a table has moved the cursor across columns.
 * 2. Checks remaining vertical space — if there isn't enough room for the
 *    title plus a configurable minimum body height, it adds a new page first
 *    so the title is never orphaned at the bottom of a page.
 *
 * @param doc          The PDFKit document
 * @param title        The section title text
 * @param options.minBodyHeight  Minimum space (in points) needed below the title
 *                               for the content that follows (default 120 — roughly
 *                               a table header + 3 data rows at 25pt each).
 */
export function generateSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
  options?: { minBodyHeight?: number }
) {
  const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;
  const minBodyHeight = options?.minBodyHeight ?? 120;

  // Height the title itself will occupy (font size + moveDown spacing)
  const titleHeight = PDF_FONTS.heading + 10;

  // Total space we need: title + minimum body content
  const requiredSpace = titleHeight + minBodyHeight;

  // Available space on the current page
  const availableSpace =
    doc.page.height - doc.y - PDF_MARGINS.bottom - 30;

  // If not enough room, start a new page
  if (availableSpace < requiredSpace) {
    doc.addPage();
  }

  // Always reset x to the left margin and render the title
  doc
    .fillColor(PDF_COLORS.primary)
    .fontSize(PDF_FONTS.heading)
    .font("Helvetica-Bold")
    .text(title, PDF_MARGINS.left, doc.y, { width: pageWidth });

  doc.moveDown(0.5);
}

// Table configuration type
export interface TableColumn {
  header: string;
  key: string;
  width: number;
  align?: "left" | "center" | "right";
}

// Generate 
export function generateTable(
  doc: PDFKit.PDFDocument,
  columns: TableColumn[],
  data: Record<string, string | number>[],
  options?: {
    startY?: number;
    rowHeight?: number;
    headerBackground?: string;
  }
) {
  const pageWidth = doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;
  const rowHeight = options?.rowHeight ?? 25;
  const headerBg = options?.headerBackground ?? PDF_COLORS.light;

  let startY = options?.startY ?? doc.y;
  let currentPage = 1;

  // Calculate column widths in points
  const columnWidths = columns.map((col) => (col.width / 100) * pageWidth);
  const xPositions: number[] = [];
  let currentX = PDF_MARGINS.left;
  for (const width of columnWidths) {
    xPositions.push(currentX);
    currentX += width;
  }

  // Minimum space needed: header + at least 3 data rows
  const minSpaceNeeded = rowHeight * 4;

  // Check if we need a new page before starting the table
  const checkSpaceBeforeTable = () => {
    const remainingSpace = doc.page.height - startY - PDF_MARGINS.bottom - 30;
    if (remainingSpace < minSpaceNeeded) {
      doc.addPage();
      currentPage++;
      startY = PDF_MARGINS.top;
    }
  };

  // Draw header row
  const drawHeader = (y: number) => {
    // Header background
    doc
      .fillColor(headerBg)
      .rect(PDF_MARGINS.left, y, pageWidth, rowHeight)
      .fill();

    // Header text - all left-aligned for uniformity
    doc
      .fillColor(PDF_COLORS.primary)
      .fontSize(PDF_FONTS.small)
      .font("Helvetica-Bold");

    columns.forEach((col, i) => {
      doc.text(col.header, xPositions[i] + 5, y + 8, {
        width: columnWidths[i] - 10,
        align: "left", // Always left-align headers
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

  // Draw data row
  const drawRow = (row: Record<string, string | number>, y: number) => {
    doc
      .fillColor(PDF_COLORS.text)
      .fontSize(PDF_FONTS.small)
      .font("Helvetica");

    columns.forEach((col, i) => {
      const value = row[col.key]?.toString() ?? "-";
      doc.text(value, xPositions[i] + 5, y + 8, {
        width: columnWidths[i] - 10,
        align: col.align ?? "left",
      });
    });

    // Row border
    doc
      .strokeColor(PDF_COLORS.border)
      .lineWidth(0.25)
      .rect(PDF_MARGINS.left, y, pageWidth, rowHeight)
      .stroke();

    return y + rowHeight;
  };

  // Check if we need a new page (need space for row + some buffer)
  const needsNewPage = (y: number) => {
    return y + rowHeight > doc.page.height - PDF_MARGINS.bottom - 30;
  };

  // Check space before starting table
  checkSpaceBeforeTable();

  // Draw header
  startY = drawHeader(startY);

  // Draw data rows
  for (const row of data) {
    if (needsNewPage(startY)) {
      doc.addPage();
      currentPage++;
      startY = PDF_MARGINS.top;
      // Re-draw header on new page
      startY = drawHeader(startY);
    }
    startY = drawRow(row, startY);
  }

  // Update doc.y position AND reset doc.x to left margin
  // This prevents subsequent text calls from inheriting a stale x offset
  doc.y = startY + 10;
  doc.x = PDF_MARGINS.left;

  return currentPage;
}

// Convert PDF document to base64
export async function pdfToBase64(doc: PDFKit.PDFDocument): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer.toString("base64"));
    });
    doc.on("error", reject);

    doc.end();
  });
}