"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dispenseSchema, type DispenseFormData } from "@/lib/schemas/dispense";
import {
  useDispenseMedicines,
  useBatchesByMedicine,
  useDispenseMedicine,
} from "@/hooks/useDispense";
import { MedicineCombobox } from "@/components/medicine-combobox";
import { BatchCombobox } from "./batch-combobox";
import { cn } from "@/lib/utils";
import type { DispenseInput } from "@/lib/types";
import { toast } from "sonner";

interface DispenseFormProps {
  userId: string;
}

export function DispenseForm({ userId }: DispenseFormProps) {
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const { data: medicines, isLoading: isLoadingMedicines } =
    useDispenseMedicines();
  const { data: batches, isLoading: isLoadingBatches } =
    useBatchesByMedicine(selectedMedicineId);
  const { mutate: dispense, isPending } = useDispenseMedicine();

  const selectedBatch = batches?.find((b) => b.id === selectedBatchId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<DispenseFormData>({
    mode: "all",
    resolver: zodResolver(dispenseSchema),
    defaultValues: {
      medicineId: "",
      stockEntriesId: "",
      quantity: undefined,
      patient: "",
      phone: "",
      notes: "",
    },
  });

  // Sync medicine selection with form
  const handleMedicineChange = (value: string) => {
    setSelectedMedicineId(value);
    setSelectedBatchId("");
    setValue("medicineId", value);
    setValue("stockEntriesId", "");
    setValue("quantity", undefined as unknown as number);
  };

  // Sync batch selection with form
  const handleBatchChange = (value: string) => {
    setSelectedBatchId(value);
    setValue("stockEntriesId", value);
  };

  const onSubmit: SubmitHandler<DispenseFormData> = (values) => {
    // Validate quantity against available stock
    if (selectedBatch && values.quantity > selectedBatch.quantity) {
      return toast.warning(
        `Insufficient stock. Only ${selectedBatch.quantity} units available.`,
      );
    }

    const data: DispenseInput = {
      stockEntriesId: values.stockEntriesId,
      quantity: values.quantity,
      patient: values.patient.trim(),
      phone: values.phone.trim(),
      notes: values.notes?.trim() || null,
    };

    dispense(
      { data, userId },
      {
        onSuccess: () => {
          // Reset form
          reset();
          setSelectedMedicineId("");
          setSelectedBatchId("");
        },
      },
    );
  };

  const handleCancel = () => {
    reset();
    setSelectedMedicineId("");
    setSelectedBatchId("");
  };

  const isBatchSelectEnabled = !!selectedMedicineId && !isLoadingBatches;
  const isFormEnabled = !!selectedBatchId;

  if (isLoadingMedicines) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader className="size-6 text-azure animate-spin" />
          <p className="text-sm text-muted-foreground">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-11/12 md:max-w-3xl mx-auto space-y-6"
      >
        {/* Medicine Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Search Medicine <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name="medicineId"
            render={({ field }) => (
              <MedicineCombobox
                medicines={medicines ?? []}
                value={field.value}
                onChange={handleMedicineChange}
                disabled={isPending}
                error={!!errors.medicineId}
              />
            )}
          />
          {errors.medicineId && (
            <p className="text-red-500 text-sm">{errors.medicineId.message}</p>
          )}
        </div>

        {/* Batch Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Select Batch <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name="stockEntriesId"
            render={({ field }) => (
              <BatchCombobox
                batches={batches ?? []}
                value={field.value}
                onChange={handleBatchChange}
                disabled={!isBatchSelectEnabled || isPending}
                error={!!errors.stockEntriesId}
              />
            )}
          />
          {errors.stockEntriesId && (
            <p className="text-red-500 text-sm">
              {errors.stockEntriesId.message}
            </p>
          )}
          {selectedMedicineId && batches?.length === 0 && !isLoadingBatches && (
            <p className="text-sm text-princeton-orange">
              No available batches for this medicine.
            </p>
          )}
        </div>

        {/* Patient Name */}
        <div className="space-y-2">
          <Label htmlFor="patient" className="text-sm font-medium">
            Patient Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="patient"
            placeholder="e.g. John Doe..."
            disabled={!isFormEnabled || isPending}
            className={cn(
              "h-11",
              errors.patient
                ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                : "focus-visible:ring-azure focus-visible:border-azure",
              !isFormEnabled && "opacity-50 cursor-not-allowed",
            )}
            {...register("patient")}
          />
          {errors.patient && (
            <p className="text-red-500 text-sm">{errors.patient.message}</p>
          )}
        </div>

        {/* Patient Phone */}
        <div className="space-y-2">
          <Label htmlFor="patient" className="text-sm font-medium">
            Patient Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="patient"
            placeholder="e.g. 07xxxxxxxx"
            disabled={!isFormEnabled || isPending}
            className={cn(
              "h-11",
              errors.phone
                ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                : "focus-visible:ring-azure focus-visible:border-azure",
              !isFormEnabled && "opacity-50 cursor-not-allowed",
            )}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-sm font-medium">
            Quantity <span className="text-red-500">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={selectedBatch?.quantity}
            placeholder="Enter quantity to dispense"
            disabled={!isFormEnabled || isPending}
            className={cn(
              "h-11",
              errors.quantity
                ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                : "focus-visible:ring-azure focus-visible:border-azure",
              !isFormEnabled && "opacity-50 cursor-not-allowed",
            )}
            {...register("quantity", { valueAsNumber: true })}
          />
          {selectedBatch && (
            <p className="text-sm text-muted-foreground">
              Available: {selectedBatch.quantity} units
            </p>
          )}
          {errors.quantity && (
            <p className="text-red-500 text-sm">{errors.quantity.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            rows={4}
            placeholder="Any additional notes..."
            disabled={!isFormEnabled || isPending}
            className={cn(
              "resize-none",
              errors.notes
                ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                : "focus-visible:ring-azure focus-visible:border-azure",
              !isFormEnabled && "opacity-50 cursor-not-allowed",
            )}
            {...register("notes")}
          />
          {errors.notes && (
            <p className="text-red-500 text-sm">{errors.notes.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            className="flex-1 bg-azure hover:bg-blue-600"
            disabled={!isFormEnabled || isPending}
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="size-4 animate-spin" />
                Dispensing...
              </span>
            ) : (
              "Dispense Medicine"
            )}
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1 text-white bg-crimson-red hover:bg-lipstick-red"
            disabled={isPending}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
