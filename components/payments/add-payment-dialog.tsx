"use client";

import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller, SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addPaymentSchema,
  type AddPaymentFormData,
} from "@/lib/schemas/payments";
import { useAddPayment } from "@/hooks/usePendingPayments";
import { PAYMENT_METHODS } from "@/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { PendingPayment } from "@/lib/types";

interface AddPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  transaction: PendingPayment | null;
}

export function AddPaymentDialog({
  open,
  setOpen,
  transaction,
}: AddPaymentDialogProps) {
  const { mutate: addPayment, isPending } = useAddPayment();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddPaymentFormData>({
    mode: "all",
    resolver: zodResolver(addPaymentSchema),
    defaultValues: {
      transactionId: "",
      method: "" as AddPaymentFormData["method"],
      amount: undefined,
      paymentCode: "",
    },
  });

  const paymentMethod = useWatch({
    control,
    name: "method",
  });

  // Reset form when transaction changes or dialog opens
  useEffect(() => {
    if (open && transaction) {
      reset({
        transactionId: transaction.id,
        method: "" as AddPaymentFormData["method"],
        amount: undefined as unknown as number,
        paymentCode: "",
      });
    }
  }, [open, transaction, reset]);

  const onSubmit: SubmitHandler<AddPaymentFormData> = (values) => {
    if (!transaction) return;

    addPayment(
      {
        transactionId: transaction.id,
        method: values.method,
        amount: values.amount,
        paymentCode: values.paymentCode?.trim(),
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            handleClose();
          }
        },
      },
    );
  };

  const handleClose = () => {
    setOpen(false);
    reset({
      transactionId: "",
      method: "" as AddPaymentFormData["method"],
      amount: undefined as unknown as number,
      paymentCode: "",
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending) {
      if (!open) {
        handleClose();
      } else {
        setOpen(open);
      }
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Add payment for {transaction.medicine.name} dispensed to{" "}
            {transaction.patient}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Transaction Summary */}
          <div className="border border-night/50 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Medicine:</span>{" "}
              <strong>{transaction.medicine.name}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Quantity:</span>{" "}
              {transaction.quantity} {transaction.medicine.unit}
            </p>
            <p>
              <span className="text-muted-foreground">Patient:</span>{" "}
              {transaction.patient}
            </p>
            <p>
              <span className="text-muted-foreground">Transaction Date:</span>{" "}
              {format(new Date(transaction.createdAt), "MMMM do, yyyy")}
            </p>
          </div>

          {/* Hidden transaction ID */}
          <input
            type="hidden"
            {...register("transactionId")}
            value={transaction.id}
          />

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={isPending}
                >
                  <SelectTrigger
                    className={cn(
                      "h-11 w-full",
                      errors.method
                        ? "border-red-400 focus:ring-red-400"
                        : "focus:ring-azure",
                    )}
                  >
                    <SelectValue placeholder="Select method..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.method && (
              <p className="text-red-500 text-sm">{errors.method.message}</p>
            )}
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount (KSH) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min={1}
              placeholder="e.g. 500"
              disabled={isPending}
              className={cn(
                "h-11",
                errors.amount
                  ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                  : "focus-visible:ring-azure focus-visible:border-azure",
              )}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment Code (not shown for cash) */}
          {paymentMethod && paymentMethod !== "cash" && (
            <div className="space-y-2">
              <Label htmlFor="paymentCode" className="text-sm font-medium">
                Payment Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentCode"
                placeholder={
                  paymentMethod === "mpesa"
                    ? "e.g. SFK7H2JDKL"
                    : paymentMethod === "card"
                      ? "e.g. TXN123456"
                      : "e.g. INS-2024-001"
                }
                disabled={isPending}
                className={cn(
                  "h-11",
                  errors.paymentCode
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("paymentCode")}
              />
              {errors.paymentCode && (
                <p className="text-red-500 text-sm">
                  {errors.paymentCode.message}
                </p>
              )}
            </div>
          )}

          {paymentMethod === "cash" && (
            <p className="text-sm text-muted-foreground">
              A payment code will be auto-generated for cash payments.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <Button
              type="submit"
              className="bg-azure hover:bg-blue-600 w-3/5"
              disabled={isPending}
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Recording...
                </span>
              ) : (
                "Record Payment"
              )}
            </Button>
            <Button
              type="button"
              className="bg-lipstick-red hover:bg-crimson-red w-1/5"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
