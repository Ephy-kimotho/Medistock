"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, SubmitHandler, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wastageSchema, type WastageFormData } from "@/lib/schemas/wastage";
import {
  useWastageMedicines,
  useBatchesForWastage,
  useRecordWastage,
} from "@/hooks/useWastage";
import { MedicineCombobox } from "@/components/medicine-combobox";
import { BatchCombobox } from "@/components/transactions/batch-combobox";
import {
  WASTAGE_REASONS,
  REASONS_REQUIRING_NOTES,
  type WastageReason,
} from "@/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { WastageInput } from "@/lib/types";

interface WastageFormProps {
  userId: string;
}

export function WastageForm({ userId }: WastageFormProps) {
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const { data: medicines, isLoading: isLoadingMedicines } =
    useWastageMedicines();
  const { data: batches, isLoading: isLoadingBatches } =
    useBatchesForWastage(selectedMedicineId);
  const { mutate: recordWastage, isPending } = useRecordWastage();

  const selectedBatch = batches?.find((b) => b.id === selectedBatchId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<WastageFormData>({
    mode: "all",
    resolver: zodResolver(wastageSchema),
    defaultValues: {
      medicineId: "",
      stockEntriesId: "",
      quantity: undefined,
      reason: undefined,
      notes: "",
    },
  });

  // Watch reason to conditionally show notes
  const selectedReason = useWatch({ control, name: "reason" });
  const showNotes = REASONS_REQUIRING_NOTES.includes(
    selectedReason as WastageReason,
  );

  // Sync medicine selection with form
  const handleMedicineChange = (value: string) => {
    setSelectedMedicineId(value);
    setSelectedBatchId("");
    setValue("medicineId", value);
    setValue("stockEntriesId", "");
    setValue("quantity", undefined as unknown as number);
    setValue("reason", undefined as unknown as WastageReason);
    setValue("notes", "");
  };

  // Sync batch selection with form
  const handleBatchChange = (value: string) => {
    setSelectedBatchId(value);
    setValue("stockEntriesId", value);
  };

  // Handle reason change - clear notes if reason doesn't require them
  const handleReasonChange = (value: string) => {
    setValue("reason", value as WastageReason);
    if (!REASONS_REQUIRING_NOTES.includes(value as WastageReason)) {
      setValue("notes", "");
    }
  };

  const onSubmit: SubmitHandler<WastageFormData> = (values) => {
    if (selectedBatch && values.quantity > selectedBatch.quantity) {
      return toast.warning(
        `Insufficient stock. Only ${selectedBatch.quantity} units available.`,
      );
    }

    const data: WastageInput = {
      stockEntriesId: values.stockEntriesId,
      quantity: values.quantity,
      reason: values.reason,
      notes: values.notes?.trim() || null,
    };

    recordWastage(
      { data, userId },
      {
        onSuccess: () => {
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

      {/* Quantity */}
      <div className="space-y-2">
        <Label htmlFor="quantity" className="text-sm font-medium">
          Quantity to Dispose <span className="text-red-500">*</span>
        </Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={selectedBatch?.quantity}
          placeholder="Enter quantity to dispose"
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

      {/* Reason Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Reason <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="reason"
          render={({ field }) => (
            <Select
              onValueChange={handleReasonChange}
              value={field.value}
              disabled={!isFormEnabled || isPending}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  errors.reason && "border-red-400",
                  !isFormEnabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <SelectValue placeholder="Select reason to dispose" />
              </SelectTrigger>
              <SelectContent>
                {WASTAGE_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.reason && (
          <p className="text-red-500 text-sm">{errors.reason.message}</p>
        )}
      </div>

      {/* Notes - Conditionally shown */}
      {showNotes && (
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="notes"
            rows={7}
            placeholder="Please provide additional details..."
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
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 mt-5">
        <Button
          type="submit"
          size="lg"
          className="flex-1 bg-crimson-red hover:bg-lipstick-red"
          disabled={!isFormEnabled || isPending}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader className="size-4 animate-spin" />
              Recording...
            </span>
          ) : (
            "Record Wastage"
          )}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="flex-1"
          disabled={isPending}
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
