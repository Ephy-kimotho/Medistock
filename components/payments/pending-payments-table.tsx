import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import type { PendingPayment } from "@/lib/types";

interface PendingPaymentsTableProps {
  payments: PendingPayment[];
  onAddPayment: (payment: PendingPayment) => void;
}

export function PendingPaymentsTable({
  payments,
  onAddPayment,
}: PendingPaymentsTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Medicine</TableHead>
            <TableHead className="font-semibold">Patient</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="font-semibold text-center">
              Quantity
            </TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="text-muted-foreground">
                {format(new Date(payment.createdAt), "MMM d, yyyy")}
                <br />
                <span className="text-xs">
                  {format(new Date(payment.createdAt), "h:mm a")}
                </span>
              </TableCell>
              <TableCell>
                <p className="font-medium capitalize">
                  {payment.medicine.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Batch: {payment.batch.batchNumber}
                </p>
              </TableCell>
              <TableCell>{payment.patient}</TableCell>
              <TableCell className="text-muted-foreground">
                {payment.phone}
              </TableCell>
              <TableCell className="text-center font-semibold">
                {payment.quantity} {payment.medicine.unit}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  size="sm"
                  className="gap-2 bg-azure hover:bg-blue-600"
                  onClick={() => onAddPayment(payment)}
                >
                  <CreditCard className="size-4" />
                  Add Payment
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
