"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Pill,
  User,
  CreditCard,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatPrice } from "@/lib/utils";
import { getAgeGroupLabel } from "@/constants";
import { AddPaymentDialog } from "@/components/payments/add-payment-dialog";
import type {
  PendingPayment,
  TransactionDetails,
  TransactionType,
} from "@/lib/types";

interface TransactionDetailsContentProps {
  transaction: TransactionDetails;
  userId: string;
}

function getTransactionTypeLabel(type: Omit<"all", TransactionType>) {
  switch (type) {
    case "dispensed":
      return "Dispense";
    case "stock_in":
      return "Stock in";
    case "wastage":
      return "Wastage";
    case "adjustment":
      return "Adjustment";
  }
}

export function TransactionDetailsContent({
  transaction,
  userId,
}: TransactionDetailsContentProps) {
  const router = useRouter();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const isDispense = transaction.type === "dispensed";
  const isWastage = transaction.type === "wastage";
  const hasPendingPayment = isDispense && !transaction.payment;

  const formatRole = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "inventory_manager":
        return "Inventory Manager";
      case "hr":
        return "HR";
      case "user":
        return "Pharmacist";
      default:
        return role;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "mpesa":
        return "M-Pesa";
      case "card":
        return "Card";
      case "insurance":
        return "Insurance";
      default:
        return method;
    }
  };

  const formatWastageReason = (reason: string) => {
    switch (reason) {
      case "expired":
        return "Expired";
      case "damaged":
        return "Damaged";
      case "recalled":
        return "Recalled";
      case "spillage":
        return "Spillage";
      case "other":
        return "Other";
      default:
        return reason;
    }
  };

  // Convert transaction to PendingPayment format for dialog
  const pendingPaymentData: PendingPayment | null = hasPendingPayment
    ? {
        id: transaction.id,
        quantity: transaction.quantity,
        patient: transaction.patient ?? "Unknown",
        phone: transaction.phone ?? "N/A",
        createdAt: transaction.createdAt,
        medicine: {
          name: transaction.medicine.name,
          unit: transaction.medicine.unit,
          unitPrice:transaction.medicine.unitPrice
        },
        batch: {
          batchNumber: transaction.batch.batchNumber,
        },
      }
    : null;

  return (
    <section className="flex-1 flex flex-col gap-4 py-6">
      {/* Header */}
      <header className="flex items-start gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 hover:bg-azure group"
                onClick={() => router.back()}
              >
                <ArrowLeft className="size-4 group-hover:text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Transactions</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 capitalize">
            {getTransactionTypeLabel(transaction.type)} Transaction details
          </h1>
          <h2 className="text-base font-medium text-slate-900">
            Medicine: {transaction.medicine.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {format(new Date(transaction.createdAt), "MMMM d, yyyy")} at{" "}
            {format(new Date(transaction.createdAt), "h:mm a")}
          </p>
        </div>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medicine Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="size-5 text-azure" />
              Medicine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium capitalize">
                {transaction.medicine.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <span
                className={cn(
                  "font-semibold",
                  transaction.type === "stock_in"
                    ? "text-medium-jungle"
                    : "text-crimson-red",
                )}
              >
                {transaction.type === "stock_in" ? "+" : "-"}
                {transaction.quantity} {transaction.medicine.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batch</span>
              <span className="font-mono">{transaction.batch.batchNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expiry Date</span>
              <span>
                {format(new Date(transaction.batch.expiryDate), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age Group</span>
              <span>{getAgeGroupLabel(transaction.medicine.ageGroup)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Patient Card (Dispense only) */}
        {isDispense && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="size-5 text-azure" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">
                  {transaction.patient ?? "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-mono">{transaction.phone ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age Group</span>
                <span>
                  {transaction.patientAgeGroup
                    ? getAgeGroupLabel(transaction.patientAgeGroup)
                    : "-"}
                </span>
              </div>
              {transaction.notes && (
                <div className="pt-2 border-t flex justify-between items:center">
                  <span className="text-muted-foreground text-sm">Dosage</span>
                  <p className="mt-1 text-sm">{transaction.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Wastage Reason Card (Wastage only) */}
        {isWastage && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="size-5 text-princeton-orange" />
                Wastage Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason</span>
                <span className="font-medium">
                  {formatWastageReason(transaction.reason)}
                </span>
              </div>
              {transaction.notes && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-sm">Notes</span>
                  <p className="mt-1 text-sm">{transaction.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Card (Dispense only) */}
        {isDispense && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="size-5 text-azure" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transaction.payment ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-1.5 text-medium-jungle">
                      <CheckCircle2 className="size-4" />
                      <span className="font-medium">Paid</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium">
                      {formatPaymentMethod(transaction.payment.method)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-base">Amount</span>
                    <span className="font-bold text-base">
                      {formatPrice(transaction.payment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-base">Payment Code</span>
                    <span className="font-bold text-base">
                      {transaction.payment.paymentCode}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="capitalize">Processed By</span>
                    <span>{transaction.payment.processedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid On</span>
                    <span>
                      {format(
                        new Date(transaction.payment.createdAt),
                        "MMMM d, yyyy, hh:mm a",
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-princeton-orange">
                    <Clock className="size-4" />
                    <span className="font-medium">Payment Pending</span>
                  </div>
                  <Button
                    className="w-full bg-azure hover:bg-blue-600"
                    onClick={() => setPaymentDialogOpen(true)}
                  >
                    <CreditCard className="size-4 mr-2" />
                    Add Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transaction Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="size-5 text-azure" />
              Transaction Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processed By</span>
              <span className="font-medium">{transaction.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge
                className={cn(
                  "py-1.5 px-3",
                  transaction.user.role === "admin" &&
                    "bg-crimson-red/10 text-crimson-red border-crimson-red",
                  transaction.user.role === "inventory_manager" &&
                    "bg-princeton-orange/10 text-princeton-orange border-princeton-orange",
                  transaction.user.role === "user" &&
                    "bg-azure/10 text-azure border-azure",
                )}
              >
                {formatRole(transaction.user.role)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>
                {format(new Date(transaction.createdAt), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span>{format(new Date(transaction.createdAt), "h:mm a")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Payment Dialog */}
      {pendingPaymentData && (
        <AddPaymentDialog
          open={paymentDialogOpen}
          setOpen={setPaymentDialogOpen}
          transaction={pendingPaymentData}
          userId={userId}
        />
      )}
    </section>
  );
}
