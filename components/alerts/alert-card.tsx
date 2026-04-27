"use client";

import {
  Clock,
  Plus,
  FileWarning,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AddStockForm } from "@/components/inventory/add-stock";
import { useMarkAlertAsRead } from "@/hooks/useAlerts";
import type { AlertWithDetails } from "@/lib/types";
import type { ALERT_TYPE } from "@/generated/prisma/client";
import Link from "next/link";

interface AlertCardProps {
  alert: AlertWithDetails;
  userId: string;
}

const alertTypeConfig: Record<
  ALERT_TYPE,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  out_of_stock: {
    label: "Out of stock",
    color: "text-crimson-red",
    bgColor: "bg-crimson-red/10",
    borderColor: "border-crimson-red",
  },
  low_stock: {
    label: "Low stock",
    color: "text-princeton-orange",
    bgColor: "bg-princeton-orange/10",
    borderColor: "border-princeton-orange",
  },
  expiry_warning: {
    label: "Expiry warning",
    color: "text-princeton-orange",
    bgColor: "bg-princeton-orange/10",
    borderColor: "border-princeton-orange",
  },
  expired: {
    label: "Expired",
    color: "text-crimson-red",
    bgColor: "bg-crimson-red/10",
    borderColor: "border-crimson-red",
  },
};

export function AlertCard({ alert, userId }: AlertCardProps) {
  const { mutate: markAsRead, isPending: isMarkingRead } = useMarkAlertAsRead();

  const config = alertTypeConfig[alert.type];
  const isStockAlert =
    alert.type === "low_stock" || alert.type === "out_of_stock";
  const isExpiryWarning = alert.type === "expiry_warning";
  const isExpired = alert.type === "expired";
  const isPending = alert.status === "pending";

  const handleMarkAsRead = () => {
    markAsRead(alert.id);
  };

  // Card border color based on alert type (only for pending alerts)
  const cardBorderClass = isPending
    ? alert.type === "out_of_stock" || alert.type === "expired"
      ? "border-crimson-red"
      : "border-princeton-orange"
    : "border-border";

  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-card p-4 shadow-md transition-colors",
        cardBorderClass,
        !isPending && "opacity-70",
      )}
    >
      {/* Header: Badge + Timestamp */}
      <div className="flex items-center gap-3 mb-3">
        <Badge
          variant="secondary"
          className={cn("font-medium", config.bgColor, config.color)}
        >
          {config.label}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          <span>
            {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="font-medium text-foreground mb-1">{alert.message}</p>

      {/* Current Stock Info */}
      <p className="text-sm text-muted-foreground mb-4">
        Current stock:{" "}
        <span
          className={cn(
            "font-medium",
            alert.currentStock === 0
              ? "text-red-600"
              : alert.currentStock <= alert.medicine.reorderlevel
                ? "text-amber-600"
                : "text-foreground",
          )}
        >
          {alert.currentStock} {alert.medicine.unit}
        </span>
      </p>

      {/* Recommendation for expiry warning */}
      {isExpiryWarning && isPending && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-md bg-amber-50 border border-amber-200">
          <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-medium">Recommendation:</span> Prioritize
            dispensing medicines from this batch before expiry. If unable to
            use, prepare to record as wastage.
          </p>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex flex-wrap gap-2">
          {/* Add Stock Button - for stock alerts (low_stock, out_of_stock) */}
          {isStockAlert && (
            <AddStockForm
              userId={userId}
              lockedMedicineId={alert.medicine.id}
              lockedMedicineName={alert.medicine.name}
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-azure text-azure hover:bg-azure/10"
              >
                <Plus className="size-4" />
                Add stock
              </Button>
            </AddStockForm>
          )}

          {/* Record Wastage Button - for expired alerts only */}
          {isExpired && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-crimson-red text-crimson-red hover:bg-crimson-red/10"
              asChild
            >
              <Link href="/transactions/wastage">
                <FileWarning className="size-4" />
                Record Wastage
              </Link>
            </Button>
          )}

          {/* Mark as Read Button - for expiry warning only */}
          {isExpiryWarning && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleMarkAsRead}
              disabled={isMarkingRead}
            >
              <CheckCircle className="size-4" />
              {isMarkingRead ? "Marking..." : "Mark as Read"}
            </Button>
          )}
        </div>
      )}

      {/* Status indicator for non-pending alerts */}
      {!isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {alert.status === "read" ? (
            <span className="italic">Marked as read</span>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="italic text-green-600">Resolved</span>
              {alert.resolvedBy && (
                <span className="text-xs">
                  by {alert.resolvedBy.name}{" "}
                  {alert.resolvedAt &&
                    formatDistanceToNow(alert.resolvedAt, { addSuffix: true })}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
