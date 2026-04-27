// components/reports/inventory/expiry-dialog.tsx
"use client";

import { Loader, FileText } from "lucide-react";
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
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useExpiryReport, useCategoriesForReport } from "@/hooks/useReports";
import { useReportPreview } from "@/hooks/useReportPreview";
import { PDFPreviewDialog } from "@/components/reports/pdf-preview-dialog";
import { format } from "date-fns";
import type { ExpiryFilters } from "@/lib/actions/reports/inventory-reports";

const EXPIRY_PERIODS = [
  { value: "all", label: "Expired + Expiring in 90 Days" },
  { value: "expired", label: "Already Expired" },
  { value: "30", label: "Expiring in 30 Days" },
  { value: "60", label: "Expiring in 60 Days" },
  { value: "90", label: "Expiring in 90 Days" },
];

interface ExpiryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExpiryDialog({ open, onClose }: ExpiryDialogProps) {
  const { mutate: generateReport, isPending } = useExpiryReport();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategoriesForReport();
  const { pdfData, isPreviewOpen, openPreview, setPreviewOpen } =
    useReportPreview();

  const { handleSubmit, control, reset } = useForm<ExpiryFilters>({
    defaultValues: {
      categoryId: "all",
      expiryPeriod: "all",
    },
  });

  const onSubmit: SubmitHandler<ExpiryFilters> = (values) => {
    generateReport(values, {
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

  const filename = `expiry-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Expiry Report</DialogTitle>
            <DialogDescription>
              Generate a PDF report of medicines expiring soon or already
              expired
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

            {/* Expiry Period Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Expiry Period</Label>
              <Controller
                control={control}
                name="expiryPeriod"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select period..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRY_PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
        title="Expiry Report"
      />
    </>
  );
}
