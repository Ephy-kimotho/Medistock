"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { usePatientByPhone } from "@/hooks/usePatients";
import { MedicineCombobox } from "@/components/medicine-combobox";
import { BatchCombobox } from "./batch-combobox";
import { PatientCombobox } from "./patient-combobox";
import { cn, preventNumbers, preventLetters, formatPrice } from "@/lib/utils";
import { AGE_GROUPS, PAYMENT_METHODS, getAgeGroupLabel } from "@/constants";
import { toast } from "sonner";
import type { DispenseInput, PatientOption } from "@/lib/types";

const PATIENT_AGE_GROUPS = AGE_GROUPS.filter(
  (group) => group.value !== "all_ages",
);

interface DispenseFormProps {
  userId: string;
}

type AgeGroup = "infant" | "pediatric" | "adult" | "geriatric";

export function DispenseForm({ userId }: DispenseFormProps) {
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(
    null,
  );

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
      isNewPatient: true,
      patientId: "",
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

  const isNewPatient = useWatch({ control, name: "isNewPatient" });
  const phoneValue = useWatch({ control, name: "phone" });
  const collectPayment = useWatch({ control, name: "collectPayment" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const quantity = useWatch({ control, name: "quantity" });

  // Check for existing patient by phone (for auto-switch)
  const { data: existingPatient } = usePatientByPhone(phoneValue || "");

  // Calculate payment amount based on quantity and unit price
  const calculatedAmount =
    selectedMedicine && quantity && quantity > 0
      ? quantity * selectedMedicine.unitPrice
      : 0;

  const handlePhoneBlur = () => {
    if (isNewPatient && existingPatient && phoneValue) {
      setValue("isNewPatient", false);
      setValue("patientId", existingPatient.id);
      setSelectedPatient(existingPatient);
      toast.info(
        `Patient "${existingPatient.name}" found. Switched to returning patient.`,
      );
    }
  };

  // Sync medicine selection with form
  const handleMedicineChange = (value: string) => {
    const medicine = medicines?.find((m) => m.id === value);

    setSelectedMedicineId(value);
    setSelectedBatchId("");
    setValue("medicineId", value);
    setValue("stockEntriesId", "");
    setValue("quantity", undefined as unknown as number);

    // Pre-fill dosage from medicine
    if (medicine) {
      setValue("notes", medicine.dosage);
    }

    // Auto-select age group for new patients if medicine has a specific age group
    if (isNewPatient && medicine && medicine.ageGroup !== "all_ages") {
      setValue("patientAgeGroup", medicine.ageGroup as AgeGroup);
    } else if (isNewPatient) {
      setValue("patientAgeGroup", undefined as unknown as AgeGroup);
    }
  };

  // Sync batch selection with form
  const handleBatchChange = (value: string) => {
    setSelectedBatchId(value);
    setValue("stockEntriesId", value);
  };

  // Handle patient type change
  const handlePatientTypeChange = (value: string) => {
    const isNew = value === "new";
    setValue("isNewPatient", isNew);

    if (isNew) {
      setValue("patientId", "");
      setSelectedPatient(null);

      // Auto-select age group if medicine has a specific age group
      if (selectedMedicine && selectedMedicine.ageGroup !== "all_ages") {
        setValue("patientAgeGroup", selectedMedicine.ageGroup as AgeGroup);
      }
    } else {
      setValue("patient", "");
      setValue("phone", "");
      setValue("patientAgeGroup", undefined as unknown as AgeGroup);
    }
  };

  // Handle returning patient selection
  const handlePatientSelect = (
    patientId: string,
    patient: PatientOption | null,
  ) => {
    setValue("patientId", patientId);
    setSelectedPatient(patient);
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
    // Validate quantity against available stock
    if (selectedBatch && values.quantity > selectedBatch.quantity) {
      return toast.warning(
        `Insufficient stock. Only ${selectedBatch.quantity} units available.`,
      );
    }

    const data: DispenseInput = {
      stockEntriesId: values.stockEntriesId,
      quantity: values.quantity,
      isNewPatient: values.isNewPatient,
      patientId: values.patientId,
      patient: values.patient?.trim(),
      phone: values.phone?.trim(),
      patientAgeGroup: values.patientAgeGroup,
      notes: values.notes?.trim() || null,
      collectPayment: values.collectPayment,
      paymentMethod: values.paymentMethod,
      // Use calculated amount instead of user input
      paymentAmount: values.collectPayment ? calculatedAmount : undefined,
      paymentCode: values.paymentCode?.trim(),
    };

    dispense(
      { data, userId },
      {
        onSuccess: () => {
          reset();
          setSelectedMedicineId("");
          setSelectedBatchId("");
          setSelectedPatient(null);
        },
      },
    );
  };

  const handleCancel = () => {
    reset();
    setSelectedMedicineId("");
    setSelectedBatchId("");
    setSelectedPatient(null);
  };

  const isBatchSelectEnabled = !!selectedMedicineId && !isLoadingBatches;
  const isFormEnabled = !!selectedBatchId;
  const isSubmitDisabled = !isFormEnabled || isPending;

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

        {/* Patient Selection */}
        <Card>
          <CardContent className="space-y-4">
            {/* Patient Type Toggle */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Patient Type</Label>
              <Controller
                control={control}
                name="isNewPatient"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value ? "new" : "returning"}
                    onValueChange={handlePatientTypeChange}
                    disabled={!isFormEnabled || isPending}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new-patient" />
                      <Label
                        htmlFor="new-patient"
                        className={cn(
                          "font-normal cursor-pointer",
                          !isFormEnabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        New Patient
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="returning"
                        id="returning-patient"
                      />
                      <Label
                        htmlFor="returning-patient"
                        className={cn(
                          "font-normal cursor-pointer",
                          !isFormEnabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        Returning Patient
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* Returning Patient: Search/Select */}
            {!isNewPatient && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Select Patient <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="patientId"
                  render={({ field }) => (
                    <PatientCombobox
                      value={field.value || ""}
                      onChange={handlePatientSelect}
                      disabled={!isFormEnabled || isPending}
                      error={!!errors.patientId}
                      ageGroup={selectedMedicine?.ageGroup}
                    />
                  )}
                />
                {errors.patientId && (
                  <p className="text-red-500 text-sm">
                    {errors.patientId.message}
                  </p>
                )}
                {selectedPatient && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {selectedPatient.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {selectedPatient.phone}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Age Group:</span>{" "}
                      {getAgeGroupLabel(selectedPatient.ageGroup)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* New Patient: Manual Entry */}
            {isNewPatient && (
              <>
                {/* Patient Name */}
                <div className="space-y-2">
                  <Label htmlFor="patient" className="text-sm font-medium">
                    Patient Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="patient"
                    placeholder="e.g. John Doe..."
                    disabled={!isFormEnabled || isPending}
                    onKeyDown={preventNumbers}
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
                    <p className="text-red-500 text-sm">
                      {errors.patient.message}
                    </p>
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
                      onKeyDown={preventLetters}
                      className={cn(
                        "h-11",
                        errors.phone
                          ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                          : "focus-visible:ring-azure focus-visible:border-azure",
                        !isFormEnabled && "opacity-50 cursor-not-allowed",
                      )}
                      {...register("phone", {
                        onBlur: handlePhoneBlur,
                      })}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">
                        {errors.phone.message}
                      </p>
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
                              "h-11 w-full",
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
                    {selectedMedicine &&
                      selectedMedicine.ageGroup !== "all_ages" && (
                        <p className="text-sm text-muted-foreground">
                          Auto-selected based on medicine (
                          {selectedMedicine.ageGroup})
                        </p>
                      )}
                  </div>
                </div>
              </>
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
              <div className="flex flex-col gap-1">
                {selectedBatch && (
                  <p className="text-sm text-muted-foreground">
                    Available: {selectedBatch.quantity} units
                  </p>
                )}
                {selectedMedicine && (
                  <p className="text-sm text-muted-foreground">
                    Unit Price: {formatPrice(selectedMedicine.unitPrice)}
                  </p>
                )}
              </div>
              {errors.quantity && (
                <p className="text-red-500 text-sm">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Dosage */}
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
              {selectedMedicine && (
                <p className="text-sm text-muted-foreground">
                  Pre-filled from medicine. You can adjust if needed.
                </p>
              )}
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
                    className="disabled:opacity-50 disabled:cursor-not-allowed data-[state=unchecked]:disabled:bg-gray-500 cursor-pointer"
                  />
                )}
              />
            </div>

            {collectPayment && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                {/* Payment Amount Display */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amount (KSH)</Label>
                  <div className="p-3 bg-background border rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">
                      {formatPrice(calculatedAmount)}
                    </p>
                    {selectedMedicine && quantity && quantity > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {quantity}
                        &times;
                        {selectedMedicine.unitPrice.toLocaleString()} ={" "}
                        {formatPrice(calculatedAmount)}
                      </p>
                    )}
                    {(!quantity || quantity <= 0) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter quantity to calculate amount
                      </p>
                    )}
                  </div>
                </div>

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
                            <SelectItem key={method.value} value={method.value}>
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
