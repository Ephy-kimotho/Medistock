import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { RecentTransactionAdmin } from "@/lib/types";

interface RecentTransactionsAdminProps {
  transactions: RecentTransactionAdmin[];
}

export function RecentTransactionsAdmin({
  transactions,
}: RecentTransactionsAdminProps) {
  const formatQuantity = (type: string, quantity: number) => {
    if (type === "stock_in") {
      return `+${quantity}`;
    }
    return `-${quantity}`;
  };

  const getQuantityStyles = (type: string) => {
    if (type === "stock_in") {
      return "text-medium-jungle";
    }
    return "text-crimson-red";
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Recent Transactions
        </h3>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1 text-sm text-azure hover:underline"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No recent transactions
        </p>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
            >
              <div>
                <p className="font-medium text-slate-900 capitalize">
                  {tx.medicineName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tx.userName} •{" "}
                  {formatDistanceToNow(new Date(tx.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <span className={cn("font-semibold", getQuantityStyles(tx.type))}>
                {formatQuantity(tx.type, tx.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
