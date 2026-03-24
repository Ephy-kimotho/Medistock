"use client";

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

  return (
    <div className="rounded-lg border border-border overflow-hidden">
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
            <TableHead className="font-semibold">Batch</TableHead>
            <TableHead className="font-semibold">Patient</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="text-muted-foreground">
                {format(new Date(transaction.date), "d/M/yyyy")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(transaction.date), "hh:mm a")}
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
              <TableCell className="font-mono text-muted-foreground">
                {transaction.batchNumber}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {transaction.patient ? transaction.patient : "-"}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {transaction.phone ? transaction.phone : "-"}
              </TableCell>
              <TableCell>{transaction.userName}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatRole(transaction.userRole)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
