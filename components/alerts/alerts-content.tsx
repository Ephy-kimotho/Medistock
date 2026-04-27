"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCard } from "./alert-card";
import { EmptyState } from "@/components/alerts/empty-state";
import { Footer } from "@/components/footer";
import {
  useAlerts,
  useAlertCounts,
  useMarkAllAlertsAsRead,
} from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";
import type { ALERT_STATUS, ALERT_TYPE } from "@/generated/prisma/client";

interface AlertsContentProps {
  userId: string;
}

const STATUS_TABS: { value: ALERT_STATUS | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "read", label: "Read" },
  { value: "dismissed", label: "Dismissed" },
];

const TYPE_OPTIONS: { value: ALERT_TYPE | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "expiry_warning", label: "Expiry Warning" },
  { value: "expired", label: "Expired" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

export function AlertsContent({ userId }: AlertsContentProps) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [statusFilter, setStatusFilter] = useState<ALERT_STATUS | "all">(
    "pending",
  );
  const [typeFilter, setTypeFilter] = useState<ALERT_TYPE | "all">("all");

  const { data: alertsData, isLoading: isLoadingAlerts } = useAlerts({
    status: statusFilter,
    type: typeFilter,
    page: currentPage,
  });
  const { data: counts, isLoading: isLoadingCounts } = useAlertCounts();
  const { mutate: markAllAsRead, isPending: isMarkingAll } =
    useMarkAllAlertsAsRead();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getTabCount = (status: ALERT_STATUS | "all") => {
    if (!counts) return 0;
    switch (status) {
      case "all":
        return counts.all;
      case "pending":
        return counts.pending;
      case "read":
        return counts.read;
      case "dismissed":
        return counts.dismissed;
      default:
        return 0;
    }
  };

  const totalPages = alertsData?.totalPages ?? 1;

  return (
    <div className="flex flex-col flex-1">
      <div className="space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Alerts and Notifications
            </h1>
            <p className="text-muted-foreground">View and manage alerts.</p>
          </div>

          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll || !counts?.pending}
          >
            {isMarkingAll ? (
              <>
                <Loader className="size-4 animate-spin mr-2" />
                Marking...
              </>
            ) : (
              "Mark all as Read"
            )}
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const count = getTabCount(tab.value);
            const isActive = statusFilter === tab.value;

            return (
              <Button
                key={tab.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "min-w-22",
                  isActive && "bg-azure hover:bg-azure/90",
                )}
                onClick={() => setStatusFilter(tab.value)}
              >
                {tab.label}{" "}
                {!isLoadingCounts && <span className="ml-1">({count})</span>}
              </Button>
            );
          })}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Filter by type:
          </span>
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as ALERT_TYPE | "all")
            }
          >
            <SelectTrigger className="w-50">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alerts List */}
        {isLoadingAlerts ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-8 animate-spin text-azure" />
          </div>
        ) : alertsData?.alerts.length === 0 ? (
          <EmptyState
            title="No alerts found"
            description={
              statusFilter === "pending"
                ? "You're all caught up! No pending alerts."
                : "No alerts match your current filters."
            }
          />
        ) : (
          <div className="space-y-4">
            {alertsData?.alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} userId={userId} />
            ))}
          </div>
        )}
      </div>

      {/* Footer with Pagination */}
      {alertsData && totalPages > 1 && (
        <div className="mt-6 pt-4 border-t">
          <Footer
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={currentPage < totalPages}
            hasPrev={currentPage > 1}
          />
        </div>
      )}
    </div>
  );
}
