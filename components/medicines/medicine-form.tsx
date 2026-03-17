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
import { useForm, SubmitHandler, Controller } from "react-hook-form";
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
import { MEDICINE_UNIT_GROUPS, type MedicineUnit } from "@/constants";
import { useCreateMedicine, useUpdateMedicine } from "@/hooks/useMedicines";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import type { MedicineInput, CategoryInfo } from "@/lib/types";

interface MedicineFormProps {
  isEditing: boolean;
  categoryInfo: CategoryInfo;
  initialValues?: MedicineInput & { id: string };
  open: boolean;
  children?: React.ReactNode;
  setOpen: (open: boolean) => void;
}

function MedicineForm({
  isEditing,
  initialValues,
  categoryInfo,
  open,
  setOpen,
  children,
}: MedicineFormProps) {
  const { mutate: createMedicine, isPending: isCreating } = useCreateMedicine();
  const { mutate: updateMedicine, isPending: isUpdating } = useUpdateMedicine();

  const isPending = isCreating || isUpdating;

  // Medicine form management with RHF and Zod
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MedicineFormData>({
    mode: "all",
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      unit: (initialValues?.unit as MedicineUnit) ?? undefined,
      reorderlevel: initialValues?.reorderlevel ?? 10,
      categoryId: initialValues?.categoryId ?? "",
      manufacturer: initialValues?.manufacturer ?? "",
    },
  });

  // Reset form when initialValues change (for editing different medicines)
  useEffect(() => {
    if (isEditing && initialValues) {
      reset({
        name: initialValues.name,
        unit: initialValues.unit as MedicineUnit,
        reorderlevel: initialValues.reorderlevel,
        categoryId: initialValues.categoryId,
        manufacturer: initialValues.manufacturer ?? "",
      });
    }
  }, [isEditing, initialValues, reset]);

  // The medicine form submit handler
  const onSubmit: SubmitHandler<MedicineFormData> = (values) => {
    const data: MedicineInput = {
      name: values.name.trim(),
      unit: values.unit,
      reorderlevel: values.reorderlevel,
      categoryId: values.categoryId,
      manufacturer: values.manufacturer?.trim() || undefined,
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
        categoryId: "",
        manufacturer: "",
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
            {isEditing ? `Edit ${initialValues?.name}` : "Add New Medicine"}
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
                      <SelectContent className="max-h-60">
                        {categoryInfo.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-red-500 text-sm">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Unit */}
              <div className="space-y-2">
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
            </div>
          </section>

          {/* Details Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Details</h3>

            <div className="grid grid-cols-1 gap-2">
              {/* Reorder Level */}
              <div className="space-y-2">
                <Label htmlFor="reorderlevel" className="text-sm font-medium">
                  Reorder Level <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reorderlevel"
                  type="number"
                  min={0}
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
