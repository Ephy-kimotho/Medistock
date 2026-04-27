import { PDF_MARGINS, PDF_COLORS, PDF_FONTS } from "./utils";

export interface BarChartData {
    label: string;
    stockIn: number;
    stockOut: number;
}

interface BarChartOptions {
    title: string;
    width: number;
    height: number;
    colors: {
        stockIn: string;
        stockOut: string;
    };
}

export interface SingleBarChartData {
    label: string;
    value: number;
}

interface SingleBarChartOptions {
    title: string;
    width: number;
    height: number;
    color: string;
    valuePrefix?: string;
}

export function drawBarChart(
    doc: PDFKit.PDFDocument,
    data: BarChartData[],
    options: BarChartOptions
) {
    const { title, width, height, colors } = options;

    // Chart positioning
    const startX = PDF_MARGINS.left;
    const startY = doc.y + 20;
    const chartWidth = width;
    const chartHeight = height - 100; // Leave room for title, labels, and legend

    // Calculate max value for scaling
    const maxValue = Math.max(
        ...data.flatMap((d) => [d.stockIn, d.stockOut]),
        1 // Prevent division by zero
    );

    // Round up to nice number for Y-axis
    const yAxisMax = calculateNiceMax(maxValue);

    // Bar dimensions
    const groupWidth = chartWidth / data.length;
    const barWidth = Math.min(groupWidth * 0.3, 40); // Max bar width of 40
    const barGap = groupWidth * 0.08;

    // Draw title
    doc
        .fontSize(PDF_FONTS.heading)
        .font("Helvetica-Bold")
        .fillColor(PDF_COLORS.primary)
        .text(title, startX, startY, {
            width: chartWidth,
            align: "center",
        });

    const chartStartY = startY + 30;
    const chartEndY = chartStartY + chartHeight;

    // Draw Y-axis
    doc
        .strokeColor(PDF_COLORS.border)
        .lineWidth(1)
        .moveTo(startX + 40, chartStartY)
        .lineTo(startX + 40, chartEndY)
        .stroke();

    // Draw X-axis
    doc
        .moveTo(startX + 40, chartEndY)
        .lineTo(startX + chartWidth, chartEndY)
        .stroke();

    // Draw Y-axis labels and grid lines
    const yAxisSteps = 5;
    doc.fontSize(PDF_FONTS.small).font("Helvetica").fillColor(PDF_COLORS.muted);

    for (let i = 0; i <= yAxisSteps; i++) {
        const value = (yAxisMax / yAxisSteps) * i;
        const y = chartEndY - (chartHeight / yAxisSteps) * i;

        // Y-axis label
        doc.text(formatNumber(value), startX, y - 4, {
            width: 35,
            align: "right",
        });

        // Grid line (except for baseline)
        if (i > 0) {
            doc
                .strokeColor("#e5e7eb")
                .lineWidth(0.5)
                .moveTo(startX + 40, y)
                .lineTo(startX + chartWidth, y)
                .stroke();
        }
    }

    // Draw bars
    const barsStartX = startX + 45; // After Y-axis

    data.forEach((item, index) => {
        const groupCenterX =
            barsStartX + index * ((chartWidth - 45) / data.length) + groupWidth / 2.5;

        // Stock In bar (left)
        const stockInHeight =
            yAxisMax > 0 ? (item.stockIn / yAxisMax) * chartHeight : 0;
        const stockInX = groupCenterX - barWidth - barGap / 2;
        const stockInY = chartEndY - stockInHeight;

        if (stockInHeight > 0) {
            doc
                .fillColor(colors.stockIn)
                .rect(stockInX, stockInY, barWidth, stockInHeight)
                .fill();

            // Stock In value on top of bar
            doc
                .fontSize(7)
                .fillColor(PDF_COLORS.text)
                .text(item.stockIn.toString(), stockInX - 5, stockInY - 12, {
                    width: barWidth + 10,
                    align: "center",
                });
        }

        // Stock Out bar (right)
        const stockOutHeight =
            yAxisMax > 0 ? (item.stockOut / yAxisMax) * chartHeight : 0;
        const stockOutX = groupCenterX + barGap / 2;
        const stockOutY = chartEndY - stockOutHeight;

        if (stockOutHeight > 0) {
            doc
                .fillColor(colors.stockOut)
                .rect(stockOutX, stockOutY, barWidth, stockOutHeight)
                .fill();

            // Stock Out value on top of bar
            doc
                .fontSize(7)
                .fillColor(PDF_COLORS.text)
                .text(item.stockOut.toString(), stockOutX - 5, stockOutY - 12, {
                    width: barWidth + 10,
                    align: "center",
                });
        }

        // X-axis label (month)
        doc
            .fontSize(PDF_FONTS.small)
            .fillColor(PDF_COLORS.muted)
            .text(
                item.label,
                groupCenterX - barWidth - 10,
                chartEndY + 8,
                { width: barWidth * 2 + 20, align: "center" }
            );
    });

    // Draw legend
    const legendY = chartEndY + 35;
    const legendX = startX + chartWidth / 2 - 90;

    // Stock In legend
    doc.fillColor(colors.stockIn).rect(legendX, legendY, 14, 14).fill();
    doc
        .fontSize(PDF_FONTS.small)
        .fillColor(PDF_COLORS.text)
        .text("Stock In", legendX + 18, legendY + 2);

    // Stock Out legend
    doc
        .fillColor(colors.stockOut)
        .rect(legendX + 90, legendY, 14, 14)
        .fill();
    doc
        .fontSize(PDF_FONTS.small)
        .fillColor(PDF_COLORS.text)
        .text("Stock Out", legendX + 108, legendY + 2);

    // Update doc.y position
    doc.y = legendY + 35;
}

// Helper to calculate a nice max value for the Y-axis
function calculateNiceMax(value: number): number {
    if (value === 0) return 100;

    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / magnitude;

    let niceNormalized: number;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 5) niceNormalized = 5;
    else niceNormalized = 10;

    return niceNormalized * magnitude;
}

// Helper to format numbers for axis labels
function formatNumber(value: number): string {
    if (value >= 1000) {
        return (value / 1000).toFixed(1) + "k";
    }
    return value.toString();
}

// Helper to format numbers compactly (e.g., 1.5K, 2.3M)
function formatCompactNumber(value: number): string {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1) + "K";
    }
    return value.toLocaleString();
}





export function drawSingleBarChart(
    doc: PDFKit.PDFDocument,
    data: SingleBarChartData[],
    options: SingleBarChartOptions
) {
    const { title, width, height, color, valuePrefix = "" } = options;

    // Chart positioning
    const startX = PDF_MARGINS.left;
    const startY = doc.y + 20;
    const chartWidth = width;
    const chartHeight = height - 80; // Leave room for title, labels, and legend

    // Calculate max value for scaling
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    // Round up to nice number for Y-axis
    const yAxisMax = calculateNiceMax(maxValue);

    // Bar dimensions
    const barWidth = Math.min((chartWidth - 60) / data.length * 0.6, 50);
    const groupWidth = (chartWidth - 60) / data.length;

    // Draw title
    doc
        .fontSize(PDF_FONTS.heading)
        .font("Helvetica-Bold")
        .fillColor(PDF_COLORS.primary)
        .text(title, startX, startY, {
            width: chartWidth,
            align: "center",
        });

    const chartStartY = startY + 30;
    const chartEndY = chartStartY + chartHeight;

    // Draw Y-axis
    doc
        .strokeColor(PDF_COLORS.border)
        .lineWidth(1)
        .moveTo(startX + 50, chartStartY)
        .lineTo(startX + 50, chartEndY)
        .stroke();

    // Draw X-axis
    doc
        .moveTo(startX + 50, chartEndY)
        .lineTo(startX + chartWidth, chartEndY)
        .stroke();

    // Draw Y-axis labels and grid lines
    const yAxisSteps = 5;
    doc.fontSize(PDF_FONTS.small).font("Helvetica").fillColor(PDF_COLORS.muted);

    for (let i = 0; i <= yAxisSteps; i++) {
        const value = (yAxisMax / yAxisSteps) * i;
        const y = chartEndY - (chartHeight / yAxisSteps) * i;

        // Y-axis label
        doc.text(formatCompactNumber(value), startX, y - 4, {
            width: 45,
            align: "right",
        });

        // Grid line (except for baseline)
        if (i > 0) {
            doc
                .strokeColor("#e5e7eb")
                .lineWidth(0.5)
                .moveTo(startX + 50, y)
                .lineTo(startX + chartWidth, y)
                .stroke();
        }
    }

    // Draw bars
    const barsStartX = startX + 55;

    data.forEach((item, index) => {
        const barCenterX = barsStartX + index * groupWidth + groupWidth / 2;
        const barX = barCenterX - barWidth / 2;

        // Bar height
        const barHeight = yAxisMax > 0 ? (item.value / yAxisMax) * chartHeight : 0;
        const barY = chartEndY - barHeight;

        if (barHeight > 0) {
            doc.fillColor(color).rect(barX, barY, barWidth, barHeight).fill();

            // Value on top of bar
            doc
                .fontSize(7)
                .fillColor(PDF_COLORS.text)
                .text(
                    `${valuePrefix}${formatCompactNumber(item.value)}`,
                    barX - 10,
                    barY - 12,
                    {
                        width: barWidth + 20,
                        align: "center",
                    }
                );
        }

        // X-axis label (month)
        doc
            .fontSize(PDF_FONTS.small)
            .fillColor(PDF_COLORS.muted)
            .text(item.label, barCenterX - 20, chartEndY + 8, {
                width: 40,
                align: "center",
            });
    });

    // Update doc.y position
    doc.y = chartEndY + 35;
}

