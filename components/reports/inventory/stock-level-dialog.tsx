// components/reports/inventory/stock-level-dialog.tsx
"use client";

import { Loader, FileText, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm, Controller, SubmitHandler, useWatch } from "react-hook-form";
import { useStockLevelReport, useMedicinesForReport } from "@/hooks/useReports";
import { useMedicineCategories } from "@/hooks/useMedicines";
import { useReportPreview } from "@/hooks/useReportPreview";
import { PDFPreviewDialog } from "@/components/reports/pdf-preview-dialog";
import { cn } from "@/lib/utils";
import { format, subMonths } from "date-fns";
import type { StockLevelFilters } from "@/lib/actions/reports/inventory-reports";

interface FormValues {
  medicineId: string;
  categoryId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface StockLevelDialogProps {
  open: boolean;
  onClose: () => void;
}

export function StockLevelDialog({ open, onClose }: StockLevelDialogProps) {
  const { mutate: generateReport, isPending } = useStockLevelReport();
  const { data: medicines = [], isLoading: isLoadingMedicines } =
    useMedicinesForReport();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useMedicineCategories();
  const { pdfData, isPreviewOpen, openPreview, setPreviewOpen } =
    useReportPreview();

  const { handleSubmit, control, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      medicineId: "",
      categoryId: "",
      dateFrom: subMonths(new Date(), 6),
      dateTo: new Date(),
    },
  });

  // Watch medicineId to conditionally show category selector
  const medicineId = useWatch({ control, name: "medicineId" });
  const isAllMedicines = medicineId === "all";

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const filters: StockLevelFilters = {
      medicineId: values.medicineId,
      categoryId: isAllMedicines ? values.categoryId : undefined,
      dateFrom: values.dateFrom ? values.dateFrom.toISOString() : null,
      dateTo: values.dateTo ? values.dateTo.toISOString() : null,
    };

    generateReport(filters, {
      onSuccess: (result) => {
        if (result.success && result.data) {
          openPreview(result.data);
        }
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      reset();
      onClose();
    }
  };

  const handleMedicineChange = (
    value: string,
    onChange: (value: string) => void,
  ) => {
    onChange(value);
    // Reset category when switching away from "all"
    if (value !== "all") {
      setValue("categoryId", "");
    }
  };

  const filename = `stock-level-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Stock Level Report</DialogTitle>
            <DialogDescription>
              Generate a bar chart report showing stock in/out trends over time
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Medicine Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Medicine <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="medicineId"
                rules={{ required: "Please select a medicine" }}
                render={({ field, fieldState }) => (
                  <>
                    <Select
                      onValueChange={(value) =>
                        handleMedicineChange(value, field.onChange)
                      }
                      value={field.value}
                      disabled={isPending || isLoadingMedicines}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          fieldState.error && "border-destructive",
                        )}
                      >
                        <SelectValue placeholder="Select medicine..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Medicines</SelectItem>
                        {medicines.map((medicine) => (
                          <SelectItem key={medicine.id} value={medicine.id}>
                            {medicine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Category Selector - Only shown when "All Medicines" is selected */}
            {isAllMedicines && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="categoryId"
                  rules={{
                    required: isAllMedicines
                      ? "Please select a category"
                      : false,
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending || isLoadingCategories}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full",
                            fieldState.error && "border-destructive",
                          )}
                        >
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-sm text-destructive">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date From */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">From Date</Label>
                <Controller
                  control={control}
                  name="dateFrom"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isPending}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {field.value
                            ? format(field.value, "dd/MM/yyyy")
                            : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">To Date</Label>
                <Controller
                  control={control}
                  name="dateTo"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isPending}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {field.value
                            ? format(field.value, "dd/MM/yyyy")
                            : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Defaults to the last 6 months if no dates are selected
            </p>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-azure hover:bg-blue-600 gap-2"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="size-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setPreviewOpen}
        pdfData={pdfData}
        filename={filename}
        title="Stock Level Report"
      />
    </>
  );
}
