import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { RecentTransactionStaff } from "@/lib/types";

interface RecentTransactionsStaffProps {
  transactions: RecentTransactionStaff[];
}

export function RecentTransactionsStaff({
  transactions,
}: RecentTransactionsStaffProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          My Recent Transactions
        </h3>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1 text-sm text-azure hover:underline"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No recent transactions
        </p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-semibold">Time</TableHead>
                <TableHead className="font-semibold">Medicine</TableHead>
                <TableHead className="font-semibold text-center">
                  Quantity
                </TableHead>
                <TableHead className="font-semibold">Person</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(tx.createdAt), "hh:mm a")}
                  </TableCell>
                  <TableCell className="font-medium capitalize">
                    {tx.medicineName}
                  </TableCell>
                  <TableCell className="text-center">{tx.quantity}</TableCell>
                  <TableCell>{tx.patient ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tx.phone ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
