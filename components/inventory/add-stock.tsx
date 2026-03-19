"use client";

import { useState } from "react";
import { Loader, Plus, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockSchema, type StockFormData } from "@/lib/schemas/stock-inventory";
import { useMedicineNames, useAddStock } from "@/hooks/useStockInventory";
import { MedicineCombobox } from "../medicine-combobox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { StockInput } from "@/lib/types";

export function AddStockForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  const { data: medicines, isLoading } = useMedicineNames();
  const { mutate: addStock, isPending } = useAddStock();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<StockFormData>({
    mode: "all",
    resolver: zodResolver(stockSchema),
    defaultValues: {
      medicineId: "",
      batchNumber: "",
      quantity: undefined,
      expiryDate: undefined,
      purchaseDate: undefined,
      purchasePrice: undefined,
      supplier: "",
      notes: "",
    },
  });

  const onSubmit: SubmitHandler<StockFormData> = (values) => {
    const data: StockInput = {
      medicineId: values.medicineId,
      batchNumber: values.batchNumber.trim(),
      quantity: values.quantity,
      initialtQuantity: values.quantity,
      expiryDate: values.expiryDate,
      purchaseDate: values.purchaseDate,
      purchasePrice: values.purchasePrice,
      supplier: values.supplier?.trim() || null,
      notes: values.notes?.trim() || null,
    };

    addStock(
      { stock: data, userId },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    setOpen(false);
    reset();
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

  if (isLoading) {
    return (
      <Button size="lg" disabled className="px-4 gap-3">
        <Loader className="size-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="px-4 bg-azure hover:bg-blue-600 gap-3">
          <Plus className="size-4 text-white" />
          <span>Add New Stock</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Add New Batch
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new stock batch to the inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          {/* Medicine Selection Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Medicine Information
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Medicine Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Medicine <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="medicineId"
                  render={({ field }) => (
                    <MedicineCombobox
                      medicines={medicines ?? []}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                      error={!!errors.medicineId}
                    />
                  )}
                />
                {errors.medicineId && (
                  <p className="text-red-500 text-sm">
                    {errors.medicineId.message}
                  </p>
                )}
              </div>

              {/* Batch Number */}
              <div className="space-y-2">
                <Label htmlFor="batchNumber" className="text-sm font-medium">
                  Batch Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="batchNumber"
                  placeholder="e.g., BN-2024-001"
                  disabled={isPending}
                  className={cn(
                    "h-11",
                    errors.batchNumber
                      ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                      : "focus-visible:ring-azure focus-visible:border-azure",
                  )}
                  {...register("batchNumber")}
                />
                {errors.batchNumber && (
                  <p className="text-red-500 text-sm">
                    {errors.batchNumber.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Quantity & Pricing Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Quantity & Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  placeholder="e.g., 100"
                  disabled={isPending}
                  className={cn(
                    "h-11",
                    errors.quantity
                      ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                      : "focus-visible:ring-azure focus-visible:border-azure",
                  )}
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {/* Purchase Price */}
              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="text-sm font-medium">
                  Purchase Price (KSH) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g., 1500"
                  disabled={isPending}
                  className={cn(
                    "h-11",
                    errors.purchasePrice
                      ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                      : "focus-visible:ring-azure focus-visible:border-azure",
                  )}
                  {...register("purchasePrice", { valueAsNumber: true })}
                />
                {errors.purchasePrice && (
                  <p className="text-red-500 text-sm">
                    {errors.purchasePrice.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Dates Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Dates</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Purchase Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Purchase Date <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isPending}
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                            errors.purchaseDate && "border-red-400",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Select purchase date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.purchaseDate && (
                  <p className="text-red-500 text-sm">
                    {errors.purchaseDate.message}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Expiry Date <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="expiryDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isPending}
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                            errors.expiryDate && "border-red-400",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Select expiry date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={field.onChange}
                          disabled={(date) => date <= new Date()}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-sm">
                    {errors.expiryDate.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Additional Information Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Additional Information
            </h3>

            {/* Supplier */}
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-sm font-medium">
                Supplier (optional)
              </Label>
              <Input
                id="supplier"
                placeholder="e.g., PharmaCorp Ltd."
                disabled={isPending}
                className={cn(
                  "h-11",
                  errors.supplier
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("supplier")}
              />
              {errors.supplier && (
                <p className="text-red-500 text-sm">
                  {errors.supplier.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Any additional notes about this batch..."
                disabled={isPending}
                className={cn(
                  "resize-none",
                  errors.notes
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-red-500 text-sm">{errors.notes.message}</p>
              )}
            </div>
          </section>

          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <Button
              size="lg"
              type="button"
              className="flex-1 sm:flex-none sm:w-44 bg-lipstick-red hover:bg-crimson-red"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              type="submit"
              className="flex-1 sm:flex-none sm:w-2/5 bg-azure hover:bg-blue-600"
              disabled={isPending}
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Batch"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
