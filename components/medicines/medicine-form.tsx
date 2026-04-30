"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { medicineSchema, type MedicineFormData } from "@/lib/schemas/medicines";
import {
  MEDICINE_UNIT_GROUPS,
  type MedicineUnit,
  AGE_GROUPS,
  DOSAGE_FREQUENCY_OPTIONS,
} from "@/constants";
import { useCreateMedicine, useUpdateMedicine } from "@/hooks/useMedicines";
import { cn } from "@/lib/utils";
import { Loader, Lock, Info } from "lucide-react";
import { formatDosage, requiresDays } from "@/lib/utils/dosage";
import type { MedicineInput, CategoryInfo } from "@/lib/types";

interface MedicineFormProps {
  isEditing: boolean;
  categoryInfo: CategoryInfo;
  initialValues?: MedicineInput & { id: string };
  open: boolean;
  children?: React.ReactNode;
  setOpen: (open: boolean) => void;
  lockedCategoryId?: string;
  lockedCategoryName?: string;
}

function MedicineForm({
  isEditing,
  initialValues,
  categoryInfo,
  open,
  setOpen,
  children,
  lockedCategoryId,
  lockedCategoryName,
}: MedicineFormProps) {
  const { mutate: createMedicine, isPending: isCreating } = useCreateMedicine();
  const { mutate: updateMedicine, isPending: isUpdating } = useUpdateMedicine();

  const isPending = isCreating || isUpdating;
  const isCategoryLocked = !!lockedCategoryId;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<MedicineFormData>({
    mode: "all",
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      unit: (initialValues?.unit as MedicineUnit) ?? undefined,
      reorderlevel: initialValues?.reorderlevel ?? 10,
      categoryId: lockedCategoryId ?? initialValues?.categoryId ?? "",
      manufacturer: initialValues?.manufacturer ?? "",
      ageGroup: initialValues?.ageGroup ?? "all_ages",
      dosageQuantity: initialValues?.dosageQuantity ?? null,
      dosageFrequency: initialValues?.dosageFrequency ?? null,
      dosageDays: initialValues?.dosageDays ?? null,
      unitPrice: initialValues?.unitPrice ?? 100,
    },
  });

  // Watch dosage fields for preview and conditional rendering
  const unit = useWatch({ control, name: "unit" });
  const dosageQuantity = useWatch({ control, name: "dosageQuantity" });
  const dosageFrequency = useWatch({ control, name: "dosageFrequency" });
  const dosageDays = useWatch({ control, name: "dosageDays" });

  // Check if days field is required based on frequency
  const isDaysRequired = requiresDays(dosageFrequency);

  // Check if days field should be disabled (as_needed or single_dose)
  const isDaysDisabled =
    !dosageFrequency ||
    dosageFrequency === "as_needed" ||
    dosageFrequency === "single_dose";

  // Generate dosage preview
  const dosagePreview = formatDosage(
    dosageQuantity,
    dosageFrequency,
    dosageDays,
    unit || "unit",
  );

  // Reset form when initialValues change (for editing different medicines)
  useEffect(() => {
    if (isEditing && initialValues) {
      reset({
        name: initialValues.name,
        unit: initialValues.unit as MedicineUnit,
        reorderlevel: initialValues.reorderlevel,
        categoryId: initialValues.categoryId,
        manufacturer: initialValues.manufacturer ?? "",
        ageGroup: initialValues.ageGroup ?? "all_ages",
        dosageQuantity: initialValues.dosageQuantity ?? null,
        dosageFrequency: initialValues.dosageFrequency ?? null,
        dosageDays: initialValues.dosageDays ?? null,
        unitPrice: initialValues.unitPrice ?? 100,
      });
    }
  }, [isEditing, initialValues, reset]);

  // Reset with locked category when dialog opens (for add mode)
  useEffect(() => {
    if (open && !isEditing && lockedCategoryId) {
      reset({
        name: "",
        unit: undefined,
        reorderlevel: 10,
        categoryId: lockedCategoryId,
        manufacturer: "",
        ageGroup: "all_ages",
        dosageQuantity: null,
        dosageFrequency: null,
        dosageDays: null,
        unitPrice: 100,
      });
    }
  }, [open, isEditing, lockedCategoryId, reset]);

  const handleFrequencyChange = (
    value: string,
    onChange: (value: string | null) => void,
  ) => {
    onChange(value);

    if (value === "as_needed") {
      // Set null WITHOUT triggering validation, then clear any stale error
      setValue("dosageDays", null, { shouldValidate: false });
      clearErrors("dosageDays");
    } else if (value === "single_dose") {
      // Auto-set to 1 day and validate
      setValue("dosageDays", 1, { shouldValidate: true });
    } else {
      // For other frequencies, trigger validation to show error if days is missing
      trigger("dosageDays");
    }
  };

  const onSubmit: SubmitHandler<MedicineFormData> = (values) => {
    const data: MedicineInput = {
      name: values.name.trim(),
      unit: values.unit,
      reorderlevel: values.reorderlevel,
      categoryId: lockedCategoryId ?? values.categoryId,
      ageGroup: values.ageGroup || "all_ages",
      manufacturer: values.manufacturer?.trim() || undefined,
      dosageQuantity: values.dosageQuantity,
      dosageFrequency: values.dosageFrequency,
      dosageDays: values.dosageDays,
      unitPrice: values.unitPrice,
    };

    if (isEditing && initialValues?.id) {
      updateMedicine(
        { id: initialValues.id, data },
        {
          onSuccess: () => {
            handleClose();
          },
        },
      );
    } else {
      createMedicine(data, {
        onSuccess: () => {
          handleClose();
        },
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (!isEditing) {
      reset({
        name: "",
        unit: undefined,
        reorderlevel: 10,
        categoryId: lockedCategoryId ?? "",
        manufacturer: "",
        ageGroup: "all_ages",
        dosageQuantity: null,
        dosageFrequency: null,
        dosageDays: null,
        unitPrice: 100,
      });
    }
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEditing && children && (
        <DialogTrigger asChild>{children}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 capitalize">
            {isEditing
              ? `Edit ${initialValues?.name}`
              : lockedCategoryName
                ? `Add Medicine to ${lockedCategoryName}`
                : "Add New Medicine"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Basic Information Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Basic Information
            </h3>

            {/* Medicine Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Medicine Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Paracetamol 500mg"
                disabled={isPending}
                className={cn(
                  "h-11",
                  errors.name
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
          </section>

          {/* Classification Section */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </Label>
                {isCategoryLocked ? (
                  <div className="relative">
                    <Input
                      id="category"
                      value={lockedCategoryName}
                      disabled
                      className="h-11 bg-muted/50 pr-10"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  </div>
                ) : (
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          id="category"
                          className={cn(
                            "h-11 w-full",
                            errors.categoryId
                              ? "border-red-400 focus:ring-red-400"
                              : "focus:ring-azure",
                          )}
                        >
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryInfo.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.categoryId && !isCategoryLocked && (
                  <p className="text-red-500 text-sm">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Age Group */}
              <div className="space-y-2">
                <Label htmlFor="ageGroup" className="text-sm font-medium">
                  Age Group
                </Label>
                <Controller
                  control={control}
                  name="ageGroup"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-11 w-full",
                          errors.ageGroup
                            ? "border-red-400 focus:ring-red-400"
                            : "focus:ring-azure",
                        )}
                      >
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {AGE_GROUPS.map((group) => (
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
                {errors.ageGroup && (
                  <p className="text-red-500 text-sm">
                    {errors.ageGroup.message}
                  </p>
                )}
              </div>
            </div>

            {/* Unit */}
            <div>
              <Label htmlFor="unit" className="text-sm font-medium">
                Unit <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="unit"
                      className={cn(
                        "h-11 w-full",
                        errors.unit
                          ? "border-red-400 focus:ring-red-400"
                          : "focus:ring-azure",
                      )}
                    >
                      <SelectValue placeholder="Select unit..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {MEDICINE_UNIT_GROUPS.map((group) => (
                        <SelectGroup key={group.label}>
                          <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {group.label}
                          </SelectLabel>
                          {group.units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit && (
                <p className="text-red-500 text-sm">{errors.unit.message}</p>
              )}
            </div>
          </section>

          {/* Pricing & Inventory Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Unit Price */}
              <div className="space-y-2">
                <Label htmlFor="unitPrice" className="text-sm font-medium">
                  Unit Price (KSH) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min={1}
                  placeholder="e.g., 100"
                  disabled={isPending}
                  className={cn(
                    "h-11",
                    errors.unitPrice
                      ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                      : "focus-visible:ring-azure focus-visible:border-azure",
                  )}
                  {...register("unitPrice", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Price charged per unit when dispensing
                </p>
                {errors.unitPrice && (
                  <p className="text-red-500 text-sm">
                    {errors.unitPrice.message}
                  </p>
                )}
              </div>

              {/* Reorder Level */}
              <div className="space-y-2">
                <Label htmlFor="reorderlevel" className="text-sm font-medium">
                  Reorder Level <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reorderlevel"
                  type="number"
                  min={5}
                  placeholder="10"
                  disabled={isPending}
                  className={cn(
                    "h-11",
                    errors.reorderlevel
                      ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                      : "focus-visible:ring-azure focus-visible:border-azure",
                  )}
                  {...register("reorderlevel", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when stock falls below this number
                </p>
                {errors.reorderlevel && (
                  <p className="text-red-500 text-sm">
                    {errors.reorderlevel.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Dosage Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Standard Dosage <span className="text-crimson-red">*</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Dosage Quantity */}
              <div className="space-y-2">
                <Label htmlFor="dosageQuantity" className="text-sm font-medium">
                  Quantity per Dose
                </Label>
                <Input
                  id="dosageQuantity"
                  type="number"
                  min={1}
                  placeholder="e.g., 10"
                  disabled={isPending}
                  className={cn(
                    errors.dosageQuantity
                      ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                      : "focus-visible:ring-azure focus-visible:border-azure",
                  )}
                  {...register("dosageQuantity", {
                    setValueAs: (v) =>
                      v === "" || v === undefined || v === null
                        ? null
                        : parseInt(v, 10),
                  })}
                />
                {errors.dosageQuantity && (
                  <p className="text-red-500 text-sm">
                    {errors.dosageQuantity.message}
                  </p>
                )}
              </div>

              {/* Dosage Frequency */}
              <div className="space-y-2">
                <Label
                  htmlFor="dosageFrequency"
                  className="text-sm font-medium"
                >
                  Frequency
                </Label>
                <Controller
                  control={control}
                  name="dosageFrequency"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value) =>
                        handleFrequencyChange(value, field.onChange)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="dosageFrequency"
                        className={cn(
                          "w-full",
                          errors.dosageFrequency
                            ? "border-red-400 focus:ring-red-400"
                            : "focus:ring-azure",
                        )}
                      >
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOSAGE_FREQUENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.dosageFrequency && (
                  <p className="text-red-500 text-sm">
                    {errors.dosageFrequency.message}
                  </p>
                )}
              </div>

              {/* Dosage Days */}
              <div className="space-y-2">
                <Label htmlFor="dosageDays" className="text-sm font-medium">
                  Number of Days
                  {isDaysRequired && <span className="text-red-500"> *</span>}
                </Label>
                <Input
                  id="dosageDays"
                  type="number"
                  min={1}
                  placeholder="e.g., 5"
                  disabled={isPending || isDaysDisabled}
                  className={cn(
                    isDaysDisabled && "bg-muted/50",
                    errors.dosageDays
                      ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                      : "focus-visible:ring-azure focus-visible:border-azure",
                  )}
                  {...register("dosageDays", {
                    setValueAs: (v) =>
                      v === "" || v === undefined || v === null
                        ? null
                        : parseInt(v, 10),
                  })}
                />
                {dosageFrequency === "single_dose" && (
                  <p className="text-xs text-muted-foreground">
                    Auto-set to 1 day for single dose
                  </p>
                )}
                {dosageFrequency === "as_needed" && (
                  <p className="text-xs text-muted-foreground">
                    Not applicable for as-needed medications
                  </p>
                )}
                {errors.dosageDays && (
                  <p className="text-red-500 text-sm">
                    {errors.dosageDays.message}
                  </p>
                )}
              </div>
            </div>

            {/* Dosage Preview */}
            {(dosageQuantity || dosageFrequency) && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="size-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-blue-900">Preview: </span>
                  <span className="text-blue-800">{dosagePreview}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Used to auto-calculate quantity when dispensing
            </p>
          </section>

          {/* Additional Details Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Additional Details
            </h3>

            {/* Manufacturer */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-sm font-medium">
                Manufacturer (Optional)
              </Label>
              <Input
                id="manufacturer"
                placeholder="e.g., GSK, Pfizer, KEMRI"
                disabled={isPending}
                className={cn(
                  "h-11",
                  errors.manufacturer
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("manufacturer")}
              />
              {errors.manufacturer && (
                <p className="text-red-500 text-sm">
                  {errors.manufacturer.message}
                </p>
              )}
            </div>
          </section>

          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <Button
              size="lg"
              type="button"
              className="flex-1 bg-lipstick-red hover:bg-crimson-red sm:flex-none sm:px-8"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              type="submit"
              className="flex-1 sm:flex-none sm:w-56 bg-azure hover:bg-blue-600"
              disabled={isPending}
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  {isEditing ? "Saving..." : "Adding..."}
                </span>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Medicine"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { MedicineForm };
