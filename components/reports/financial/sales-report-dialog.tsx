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
import { useSalesReport } from "@/hooks/useReports";
import { useReportPreview } from "@/hooks/useReportPreview";
import { PDFPreviewDialog } from "@/components/reports/pdf-preview-dialog";
import { format, subMonths } from "date-fns";
import { DateRangePicker } from "@/components/date-range-picker";
import type { SalesReportFilters } from "@/lib/actions/reports/financial-reports";

const PAYMENT_METHODS = [
  { value: "all", label: "All Methods" },
  { value: "cash", label: "Cash" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "card", label: "Card" },
  { value: "insurance", label: "Insurance" },
];

interface FormValues {
  paymentMethod: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface SalesReportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SalesReportDialog({ open, onClose }: SalesReportDialogProps) {
  const { mutate: generateReport, isPending } = useSalesReport();
  const { pdfData, isPreviewOpen, openPreview, setPreviewOpen } =
    useReportPreview();

  const { handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: {
      paymentMethod: "all",
      dateFrom: subMonths(new Date(), 3),
      dateTo: new Date(),
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const filters: SalesReportFilters = {
      paymentMethod: values.paymentMethod,
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

  const filename = `sales-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cash In Report</DialogTitle>
            <DialogDescription>
              Generate a PDF report of all the revenue breakdown
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Method</Label>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
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
            </div>

            {/* Date Range */}
            <DateRangePicker
              control={control}
              nameFrom="dateFrom"
              nameTo="dateTo"
              disabled={isPending}
            />

            <p className="text-xs text-muted-foreground">
              Defaults to the last 3 months if no dates are selected
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
        title="Cash In Report"
      />
    </>
  );
}
