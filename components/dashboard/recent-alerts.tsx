import Link from "next/link";
import { ArrowRight, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { RecentAlert } from "@/lib/types";
import type { ALERT_TYPE } from "@/generated/prisma/client";

interface RecentAlertsProps {
  alerts: RecentAlert[];
}

const alertTypeConfig: Record<
  ALERT_TYPE,
  { label: string; color: string; bgColor: string }
> = {
  out_of_stock: {
    label: "Out of stock",
    color: "text-crimson-red",
    bgColor: "bg-crimson-red/10",
  },
  low_stock: {
    label: "Low stock",
    color: "text-princeton-orange",
    bgColor: "bg-princeton-orange/10",
  },
  expiry_warning: {
    label: "Expiry warning",
    color: "text-princeton-orange",
    bgColor: "bg-princeton-orange/10",
  },
  expired: {
    label: "Expired",
    color: "text-crimson-red",
    bgColor: "bg-crimson-red/10",
  },
};

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Recent Alerts</h3>
        <Link
          href="/alerts"
          className="inline-flex items-center gap-1 text-sm text-azure hover:underline"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex items-center justify-center size-12 rounded-full bg-green-100 mb-3">
            <AlertTriangle className="size-6 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground">
            No pending alerts. You&apos;re all caught up!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = alertTypeConfig[alert.type];

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium",
                        config.bgColor,
                        config.color,
                      )}
                    >
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground truncate">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span>
                      {formatDistanceToNow(alert.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
