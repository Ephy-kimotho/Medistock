"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getTransactionTypeLabel, getTransactionTypeStyles } from "@/constants";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { TransactionWithDetails } from "@/lib/types";

interface TransactionTableProps {
  transactions: TransactionWithDetails[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const router = useRouter();

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

  const formatRole = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "inventory_manager":
        return "Manager";
      case "hr":
        return "HR";
      case "user":
        return "Staff";
      default:
        return role;
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/transactions/${id}`);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden mt-2">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Time</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Medicine</TableHead>
            <TableHead className="font-semibold text-center">
              Quantity
            </TableHead>
            <TableHead className="font-semibold">Processed By</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              onClick={() => handleRowClick(transaction.id)}
              className="cursor-pointer hover:bg-muted/50 py-2"
            >
              <TableCell>
                <span>{format(new Date(transaction.date), "dd/MM/yyyy")}</span>
              </TableCell>
              <TableCell>
                <span>{format(new Date(transaction.date), "hh:mm a")}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-medium",
                    getTransactionTypeStyles(transaction.type),
                  )}
                >
                  {getTransactionTypeLabel(transaction.type)}
                </Badge>
              </TableCell>
              <TableCell className="font-medium capitalize">
                {transaction.medicineName}
              </TableCell>
              <TableCell
                className={cn(
                  "text-center font-semibold",
                  getQuantityStyles(transaction.type),
                )}
              >
                {formatQuantity(transaction.type, transaction.quantity)}
              </TableCell>
              <TableCell>
                <span className="font-medium">{transaction.userName}</span>
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "py-1.5 px-3",
                    transaction.userRole === "admin" &&
                      "bg-crimson-red/10 text-crimson-red border-crimson-red",
                    transaction.userRole === "inventory_manager" &&
                      "bg-princeton-orange/10 text-princeton-orange border-princeton-orange",
                    transaction.userRole === "user" &&
                      "bg-azure/10 text-azure border-azure",
                  )}
                >
                  {formatRole(transaction.userRole)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
