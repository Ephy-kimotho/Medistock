import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import resend from "@/lib/email-client"
import {
  checkAndCreateExpiryAlerts,
  checkAllStockLevelAlerts,
} from "@/lib/utils/stock-alerts";
import { AlertSummaryEmail } from "@/lib/emails/AlertSummaryEmail";
import { format } from "date-fns";


export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run alert checks (creates new alerts if needed)
    const [expiryResult, stockResult] = await Promise.all([
      checkAndCreateExpiryAlerts(30),
      checkAllStockLevelAlerts(),
    ]);

    const newAlertsCreated = expiryResult.created + stockResult.created;

    // Fetch ALL pending alerts
    const pendingAlerts = await prisma.alerts.findMany({
      where: {
        status: "pending",
      },
      include: {
        medicines: {
          select: { name: true, unit: true, reorderlevel: true },
        },
        stockEntry: {
          select: { batchNumber: true, quantity: true, expiryDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // If no pending alerts, skip email
    if (pendingAlerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending alerts to report",
        newAlertsCreated,
        pendingAlertsCount: 0,
      });
    }

    // Group alerts by type
    const outOfStock = pendingAlerts
      .filter((a) => a.type === "out_of_stock")
      .map((a) => ({
        message: a.medicines.name,
        details: `0 ${a.medicines.unit} remaining`,
      }));

    const lowStock = pendingAlerts
      .filter((a) => a.type === "low_stock")
      .map((a) => ({
        message: a.medicines.name,
        details: `${a.stockEntry.quantity} ${a.medicines.unit} (reorder level: ${a.medicines.reorderlevel})`,
      }));

    const expiringSoon = pendingAlerts
      .filter((a) => a.type === "expiry_warning")
      .map((a) => ({
        message: `${a.medicines.name} (Batch: ${a.stockEntry.batchNumber})`,
        details: `Expires ${format(a.stockEntry.expiryDate, "MMM d, yyyy")}`,
      }));

    const expired = pendingAlerts
      .filter((a) => a.type === "expired")
      .map((a) => ({
        message: `${a.medicines.name} (Batch: ${a.stockEntry.batchNumber})`,
        details: `Expired ${format(a.stockEntry.expiryDate, "MMM d, yyyy")}`,
      }));

    // Get facility settings
    const settings = await prisma.settings.findFirst();
    const facilityName = settings?.facilityName || "MediStock";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Get all admins and inventory managers
    const recipients = await prisma.user.findMany({
      where: {
        role: { in: ["admin", "inventory_manager"] },
        banned: false,
        emailAlertEnabled: true,
      },
      select: { email: true, name: true },
    });

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Pending alerts exist but no recipients found",
        newAlertsCreated,
        pendingAlertsCount: pendingAlerts.length,
      });
    }

    // Send email to all recipients
    const emailPromises = recipients.map((recipient) =>
      resend.emails
        .send({
          from: `MediStock <${process.env.EMAIL_FROM || "noreply@medistock.com"}>`,
          to: recipient.email,
          subject: `MediStock Alert Summary - ${format(new Date(), "MMMM d, yyyy")}`,
          react: AlertSummaryEmail({
            facilityName,
            date: format(new Date(), "EEEE, MMMM d, yyyy"),
            outOfStock,
            lowStock,
            expiringsSoon: expiringSoon,
            expired,
            alertsUrl: `${appUrl}/alerts`,
          }),
        })
        .catch((error) => {
          console.error(`Failed to send email to ${recipient.email}:`, error);
          return null;
        })
    );

    const emailResults = await Promise.allSettled(emailPromises);
    const successfulEmails = emailResults.filter(
      (r) => r.status === "fulfilled" && r.value !== null
    ).length;

    return NextResponse.json({
      success: true,
      message: `Sent alert summary to ${successfulEmails} recipients`,
      newAlertsCreated,
      pendingAlertsCount: pendingAlerts.length,
      breakdown: {
        out_of_stock: outOfStock.length,
        low_stock: lowStock.length,
        expiry_warning: expiringSoon.length,
        expired: expired.length,
      },
      recipientCount: recipients.length,
      emailsSent: successfulEmails,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}