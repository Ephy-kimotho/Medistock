"use client";

import { Clock, Plus, X, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AddStockForm } from "@/components/inventory/add-stock";
import { useDismissAlert } from "@/hooks/useAlerts";
import type { AlertWithDetails } from "@/lib/actions/alerts";
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
  const { mutate: dismiss, isPending: isDismissing } = useDismissAlert();

  const config = alertTypeConfig[alert.type];
  const isStockAlert =
    alert.type === "low_stock" || alert.type === "out_of_stock";
  const isExpiryAlert =
    alert.type === "expiry_warning" || alert.type === "expired";
  const isPending = alert.status === "pending";

  const handleDismiss = () => {
    dismiss(alert.id);
  };

  // Card border color based on alert type (only for pending alerts)
  const cardBorderClass = isPending
    ? alert.type === "out_of_stock" || alert.type === "expired"
      ? "border-b-crimson-red"
      : alert.type === "low_stock"
        ? "border-princeton-orange"
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

      {/* Actions */}
      {isPending && (
        <div className="flex flex-wrap gap-2">
          {/* Add Stock Button - for stock alerts */}
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

          {/* Record Wastage Button - for expiry alerts */}
          {isExpiryAlert && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
              asChild
            >
              <Link href="/transactions/wastage">
                <FileWarning className="size-4" />
                Record Wastage
              </Link>
            </Button>
          )}

          {/* Dismiss Button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
            onClick={handleDismiss}
            disabled={isDismissing}
          >
            <X className="size-4" />
            Dismiss
          </Button>
        </div>
      )}

      {/* Status indicator for non-pending alerts */}
      {!isPending && (
        <p className="text-sm text-muted-foreground italic">
          {alert.status === "read" ? "Marked as read" : "Dismissed"}
        </p>
      )}
    </div>
  );
}
