import PDFDocument from "pdfkit";
import { getInitials, formatRole } from "@/lib/utils";
import { PDF_COLORS } from "./utils";
import type { EmployeeCardData } from "@/lib/types";


const CARD_WIDTH = 252;
const CARD_HEIGHT = 324;

export async function generateEmployeeCard(
  data: EmployeeCardData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [CARD_WIDTH, CARD_HEIGHT],
        margins: { top: 20, bottom: 20, left: 20, right: 20 },
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header sections
      doc.rect(0, 0, CARD_WIDTH, 70).fill(PDF_COLORS.primary);

      // Employee Tag Title
      doc
        .font("Times-Bold")
        .fontSize(18)
        .fillColor(PDF_COLORS.white)
        .text("EMPLOYEE TAG", 0, 20, {
          width: CARD_WIDTH,
          align: "center",
        });

      // Facility Name
      doc
        .font("Times-Roman")
        .fontSize(14)
        .fillColor(PDF_COLORS.white)
        .text(data.facilityName, 0, 45, {
          width: CARD_WIDTH,
          align: "center",
        });

      // Photo Section
      const photoSize = 80;
      const photoX = (CARD_WIDTH - photoSize) / 2;
      const photoY = 90;

      if (data.imageBuffer) {
        // Draw a circular clipped image
        doc.save();
        doc
          .circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2)
          .clip();
        doc.image(data.imageBuffer, photoX, photoY, {
          width: photoSize,
          height: photoSize,
          fit: [photoSize, photoSize],
          align: "center",
          valign: "center",
        });
        doc.restore();

        doc
          .circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2)
          .lineWidth(2)
          .stroke(PDF_COLORS.primary);
      } else {
        // Draw a circle with Initials
        const initials = getInitials(data.name);

        doc
          .circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2)
          .fill(PDF_COLORS.primary);

        doc
          .font("Times-Bold")
          .fontSize(28)
          .fillColor(PDF_COLORS.white)
          .text(initials, photoX, photoY + photoSize / 2 - 12, {
            width: photoSize,
            align: "center",
          });
      }

      // Details Section
      const detailsY = photoY + photoSize + 30;

      // Name
      doc
        .font("Times-Bold")
        .fontSize(16)
        .fillColor(PDF_COLORS.black)
        .text(data.name, 0, detailsY, {
          width: CARD_WIDTH,
          align: "center",
        });

      // Role
      doc
        .font("Times-Roman")
        .fontSize(12)
        .fillColor(PDF_COLORS.gray)
        .text(formatRole(data.role), 0, detailsY + 25, {
          width: CARD_WIDTH,
          align: "center",
        });

      // Divider
      const dividerY = detailsY + 50;
      doc
        .moveTo(CARD_WIDTH / 4, dividerY)
        .lineTo((CARD_WIDTH * 3) / 4, dividerY)
        .lineWidth(1)
        .stroke(PDF_COLORS.lightGray);

      // Employee ID
      doc
        .font("Times-Roman")
        .fontSize(9)
        .fillColor(PDF_COLORS.gray)
        .text("EMPLOYEE ID", 0, dividerY + 15, {
          width: CARD_WIDTH,
          align: "center",
        });
      doc
        .font("Times-Bold")
        .fontSize(14)
        .fillColor(PDF_COLORS.primary)
        .text(data.employeeId, 0, dividerY + 30, {
          width: CARD_WIDTH,
          align: "center",
        });

      doc.rect(0, CARD_HEIGHT - 20, CARD_WIDTH, 20).fill(PDF_COLORS.primary);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}