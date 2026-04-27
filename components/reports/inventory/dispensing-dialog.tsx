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
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  useDispensingReport,
  useCategoriesForReport,
} from "@/hooks/useReports";
import { useReportPreview } from "@/hooks/useReportPreview";
import { PDFPreviewDialog } from "@/components/reports/pdf-preview-dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { DispensingFilters } from "@/lib/actions/reports/inventory-reports";

interface FormValues {
  categoryId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface DispensingDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DispensingDialog({ open, onClose }: DispensingDialogProps) {
  const { mutate: generateReport, isPending } = useDispensingReport();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategoriesForReport();
  const { pdfData, isPreviewOpen, openPreview, setPreviewOpen } =
    useReportPreview();

  const { handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: {
      categoryId: "all",
      dateFrom: undefined,
      dateTo: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const filters: DispensingFilters = {
      categoryId: values.categoryId,
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

  const filename = `dispensing-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dispensing Report</DialogTitle>
            <DialogDescription>
              Generate a PDF report of all dispense transactions with patient
              demographics
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending || isLoadingCategories}
                  >
                    <SelectTrigger className="w-full">
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
                )}
              />
            </div>

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
                          initialFocus
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>

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
        title="Dispensing Report"
      />
    </>
  );
}
