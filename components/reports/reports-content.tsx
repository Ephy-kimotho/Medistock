"use client";

import { useState } from "react";
import {
  Users,
  Activity,
  PieChart,
  Package,
  AlertTriangle,
  Calendar,
  Pill,
  CreditCard,
  Trash2,
} from "lucide-react";
import { ReportSection } from "./report-section";
import { ReportCard } from "./report-card";

// HR Dialogs
import { EmployeeDirectoryDialog } from "./hr/employee-directory-dialog";
import { EmployeeActivityDialog } from "./hr/employee-activity-dialog";
import { RoleDistributionDialog } from "./hr/role-distribution-dialog";

// Inventory Dialogs
import { StockLevelDialog } from "./inventory/stock-level-dialog";
import { LowStockDialog } from "./inventory/low-stock-dialog";
import { ExpiryDialog } from "./inventory/expiry-dialog";
import { DispensingDialog } from "./inventory/dispensing-dialog";
import { WastageDialog } from "@/components/reports/inventory/wastage-dialog";

// Financial Dialogs
import { SalesReportDialog } from "./financial/sales-report-dialog";

interface ReportsContentProps {
  canAccessHR: boolean;
  canAccessInventory: boolean;
}

type DialogType =
  | "employee-directory"
  | "employee-activity"
  | "role-distribution"
  | "stock-level"
  | "low-stock"
  | "expiry"
  | "dispensing"
  | "wastage"
  | "sales"
  | null;

export function ReportsContent({
  canAccessHR,
  canAccessInventory,
}: ReportsContentProps) {
  const [openDialog, setOpenDialog] = useState<DialogType>(null);

  const closeDialog = () => setOpenDialog(null);

  return (
    <div className="space-y-8">
      {/* HR Reports */}
      {canAccessHR && (
        <ReportSection
          title="HR Reports"
          description="Employee management and activity reports"
        >
          <ReportCard
            title="Employee Directory"
            description="Complete list of all employees with their details and status"
            icon={Users}
            onGenerate={() => setOpenDialog("employee-directory")}
          />
          <ReportCard
            title="Employee Activity"
            description="Transaction history and activity logs per employee"
            icon={Activity}
            onGenerate={() => setOpenDialog("employee-activity")}
          />
          <ReportCard
            title="Role Distribution"
            description="Breakdown of employees by role and status"
            icon={PieChart}
            onGenerate={() => setOpenDialog("role-distribution")}
          />
        </ReportSection>
      )}

      {/* Inventory Reports */}
      {canAccessInventory && (
        <ReportSection
          title="Inventory Reports"
          description="Stock levels, expiry tracking, and dispensing records"
        >
          <ReportCard
            title="Stock Level"
            description="Current stock quantities across all medicines"
            icon={Package}
            iconColor="text-medium-jungle"
            iconBgColor="bg-medium-jungle/10"
            onGenerate={() => setOpenDialog("stock-level")}
          />
          <ReportCard
            title="Low Stock Alert"
            description="Medicines below their reorder level threshold"
            icon={AlertTriangle}
            iconColor="text-princeton-orange"
            iconBgColor="bg-princeton-orange/10"
            onGenerate={() => setOpenDialog("low-stock")}
          />
          <ReportCard
            title="Expiry Report"
            description="Medicines expiring soon or already expired"
            icon={Calendar}
            iconColor="text-crimson-red"
            iconBgColor="bg-crimson-red/10"
            onGenerate={() => setOpenDialog("expiry")}
          />
          <ReportCard
            title="Dispensing Report"
            description="Dispensing history with patient demographics"
            icon={Pill}
            iconColor="text-azure"
            iconBgColor="bg-azure/10"
            onGenerate={() => setOpenDialog("dispensing")}
          />
          <ReportCard
            title="Wastage Report"
            description="Track medicine wastage with breakdown by reason"
            icon={Trash2}
            iconColor="text-crimson-red"
            iconBgColor="bg-crimson-red/10"
            onGenerate={() => setOpenDialog("wastage")}
          />
        </ReportSection>
      )}

      {/* Financial Reports */}
      {canAccessInventory && (
        <ReportSection
          title="Financial Reports"
          description="Sales and payment tracking"
        >
          <ReportCard
            title="Sales Report"
            description="Revenue breakdown by payment method and period"
            icon={CreditCard}
            iconColor="text-medium-jungle"
            iconBgColor="bg-medium-jungle/10"
            onGenerate={() => setOpenDialog("sales")}
          />
        </ReportSection>
      )}

      {/* HR Dialogs */}
      <EmployeeDirectoryDialog
        open={openDialog === "employee-directory"}
        onClose={closeDialog}
      />
      <EmployeeActivityDialog
        open={openDialog === "employee-activity"}
        onClose={closeDialog}
      />
      <RoleDistributionDialog
        open={openDialog === "role-distribution"}
        onClose={closeDialog}
      />

      {/* Inventory Dialogs */}
      <StockLevelDialog
        open={openDialog === "stock-level"}
        onClose={closeDialog}
      />
      <LowStockDialog open={openDialog === "low-stock"} onClose={closeDialog} />
      <ExpiryDialog open={openDialog === "expiry"} onClose={closeDialog} />
      <DispensingDialog
        open={openDialog === "dispensing"}
        onClose={closeDialog}
      />

      <WastageDialog
        open={openDialog === "wastage"}
        onClose={() => setOpenDialog(null)}
      />

      {/* Financial Dialogs */}
      <SalesReportDialog open={openDialog === "sales"} onClose={closeDialog} />
    </div>
  );
}
