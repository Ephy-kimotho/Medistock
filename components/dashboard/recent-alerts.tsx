import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecentAlerts() {
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

      {/* Placeholder */}
      <p className="text-sm text-muted-foreground py-4 text-center">
        No recent alerts
      </p>
    </div>
  );
}
