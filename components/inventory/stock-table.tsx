"use client";

import { Check, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { StockWithMedicine } from "@/lib/types";

interface StockTableProps {
  stocks: StockWithMedicine[];
}

export function StockTable({ stocks }: StockTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <Check className="size-4 text-medium-jungle" />;
      case "expiring_soon":
        return <AlertCircle className="size-4 text-princeton-orange" />;
      case "expired":
        return <XCircle className="size-4 text-crimson-red" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "good":
        return "Good";
      case "expiring_soon":
        return "Expiring Soon";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "good":
        return "text-medium-jungle";
      case "expiring_soon":
        return "text-princeton-orange";
      case "expired":
        return "bg-red-50 text-crimson-red";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold">Medicine Name</TableHead>
            <TableHead className="font-semibold">Batch Number</TableHead>
            <TableHead className="font-semibold text-center">
              Quantity
            </TableHead>
            <TableHead className="font-semibold text-center">
              Initial Qty
            </TableHead>
            <TableHead className="font-semibold">Purchase Date</TableHead>
            <TableHead className="font-semibold">Expiry Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow
              key={stock.id}
              className={cn(
                stock.stockStatus === "expired" && "bg-red-50/50",
                stock.stockStatus === "expiring_soon" && "bg-orange-50/50",
              )}
            >
              <TableCell className="font-medium capitalize">
                {stock.medicineName}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono">
                {stock.batchNumber}
              </TableCell>
              <TableCell className="text-center font-semibold">
                {stock.quantity}
              </TableCell>
              <TableCell className="text-center">
                {stock.initialQuantity}
              </TableCell>
              <TableCell className="">
                {format(new Date(stock.purchaseDate), "MMMM d, yyyy")}
              </TableCell>
              <TableCell className="">
                {format(new Date(stock.expiryDate), "MMMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium",
                    getStatusStyles(stock.stockStatus),
                  )}
                >
                  {getStatusIcon(stock.stockStatus)}
                  <span>{getStatusLabel(stock.stockStatus)}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
