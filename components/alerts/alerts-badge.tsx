"use client";

import { usePendingAlertCount } from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";

interface AlertBadgeProps {
  className?: string;
}

export function AlertBadge({ className }: AlertBadgeProps) {
  const { data: count, isLoading } = usePendingAlertCount();

  // Don't show badge if no pending alerts or still loading
  if (isLoading || !count || count === 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}