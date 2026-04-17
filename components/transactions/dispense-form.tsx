"use client";

import { useState } from "react";
import { Loader, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useForm, SubmitHandler, Controller, useWatch } from "react-hook-form";
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
import { AGE_GROUPS, getAgeGroupLabel, PAYMENT_METHODS } from "@/constants";
import type { DispenseInput } from "@/lib/types";
import { toast } from "sonner";

const PATIENT_AGE_GROUPS = AGE_GROUPS.filter(
  (group) => group.value !== "all_ages",
);

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
  const selectedMedicine = medicines?.find((m) => m.id === selectedMedicineId);

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
      patientAgeGroup: undefined,
      notes: "",
      collectPayment: false,
      paymentMethod: undefined,
      paymentAmount: undefined,
      paymentCode: "",
    },
  });

  const patientAgeGroup = useWatch({ control, name: "patientAgeGroup" });
  const collectPayment = useWatch({ control, name: "collectPayment" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  // Check if there's an age group mismatch
  const hasAgeGroupMismatch = (() => {
    if (!selectedMedicine || !patientAgeGroup) return false;
    if (selectedMedicine.ageGroup === "all_ages") return false;
    return selectedMedicine.ageGroup !== patientAgeGroup;
  })();

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

  // Handle payment toggle
  const handlePaymentToggle = (checked: boolean) => {
    setValue("collectPayment", checked);
    if (!checked) {
      setValue("paymentMethod", undefined);
      setValue("paymentAmount", undefined as unknown as number);
      setValue("paymentCode", "");
    }
  };

  const onSubmit: SubmitHandler<DispenseFormData> = (values) => {
    // Double-check age group validation
    if (hasAgeGroupMismatch) {
      return toast.error(
        `Cannot dispense: Medicine is for ${getAgeGroupLabel(selectedMedicine!.ageGroup)} patients, but patient is ${getAgeGroupLabel(values.patientAgeGroup!)}.`,
      );
    }

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
      patientAgeGroup: values.patientAgeGroup!,
      notes: values.notes?.trim() || null,
      collectPayment: values.collectPayment,
      paymentMethod: values.paymentMethod,
      paymentAmount: values.paymentAmount,
      paymentCode: values.paymentCode?.trim(),
    };

    dispense(
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
  const isSubmitDisabled = !isFormEnabled || isPending || hasAgeGroupMismatch;

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
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Medicine Selection */}
        <Card>
          <CardContent className="space-y-4">
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
                <p className="text-red-500 text-sm">
                  {errors.medicineId.message}
                </p>
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
              {selectedMedicineId &&
                batches?.length === 0 &&
                !isLoadingBatches && (
                  <p className="text-sm text-princeton-orange">
                    No available batches for this medicine.
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Patient info */}
        <Card>
          <CardContent className="space-y-4">
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

            {/* Patient Phone and Age Group Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g. 07xxxxxxxx"
                  disabled={!isFormEnabled || isPending}
                  className={cn(
                    "py-4",
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

              {/* Patient Age Group */}
              <div className="space-y-2">
                <Label
                  htmlFor="patientAgeGroup"
                  className="text-sm font-medium"
                >
                  Patient Age Group <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="patientAgeGroup"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isFormEnabled || isPending}
                    >
                      <SelectTrigger
                        className={cn(
                          "py-4 w-full",
                          errors.patientAgeGroup
                            ? "border-red-400 focus:ring-red-400"
                            : "focus:ring-azure",
                          !isFormEnabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <SelectValue placeholder="Select age group..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PATIENT_AGE_GROUPS.map((group) => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}{" "}
                            <span className="text-muted-foreground">
                              ({group.description})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.patientAgeGroup && (
                  <p className="text-red-500 text-sm">
                    {errors.patientAgeGroup.message}
                  </p>
                )}
              </div>
            </div>

            {/* Age Group Mismatch Warning */}
            {hasAgeGroupMismatch && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    Age Group Mismatch — Cannot Dispense
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    This medicine ({selectedMedicine?.name}) is designated for{" "}
                    <strong>
                      {getAgeGroupLabel(selectedMedicine!.ageGroup)}
                    </strong>{" "}
                    patients, but the selected patient age group is{" "}
                    <strong>{getAgeGroupLabel(patientAgeGroup!)}</strong>.
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    Please select a different medicine or correct the
                    patient&apos;s age group.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional details */}
        <Card>
          <CardContent className="space-y-4">
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
                <p className="text-red-500 text-sm">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Dosage <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="e.g. 2 times daily."
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
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="collectPayment" className="text-sm font-medium">
                  Collect Payment
                </Label>
                <p className="text-sm text-muted-foreground">
                  Record payment for this dispense
                </p>
              </div>
              <Controller
                control={control}
                name="collectPayment"
                render={({ field }) => (
                  <Switch
                    id="collectPayment"
                    checked={field.value}
                    onCheckedChange={handlePaymentToggle}
                    disabled={!isFormEnabled || isPending}
                  />
                )}
              />
            </div>

            {collectPayment && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Payment Method <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isPending}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-full",
                              errors.paymentMethod
                                ? "border-red-400 focus:ring-red-400"
                                : "focus:ring-azure",
                            )}
                          >
                            <SelectValue placeholder="Select method..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                              >
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.paymentMethod && (
                      <p className="text-red-500 text-sm">
                        {errors.paymentMethod.message}
                      </p>
                    )}
                  </div>

                  {/* Payment Amount */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="paymentAmount"
                      className="text-sm font-medium"
                    >
                      Amount (KSH) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      min={1}
                      placeholder="e.g. 500"
                      disabled={isPending}
                      className={cn(
                        errors.paymentAmount
                          ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                          : "focus-visible:ring-azure focus-visible:border-azure",
                      )}
                      {...register("paymentAmount", { valueAsNumber: true })}
                    />
                    {errors.paymentAmount && (
                      <p className="text-red-500 text-sm">
                        {errors.paymentAmount.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Code (not shown for cash) */}
                {paymentMethod && paymentMethod !== "cash" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="paymentCode"
                      className="text-sm font-medium"
                    >
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            className="flex-1 bg-azure hover:bg-blue-600"
            disabled={isSubmitDisabled}
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
