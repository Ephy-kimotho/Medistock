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
import { useRoleDistributionReport } from "@/hooks/useReports";
import { useReportPreview } from "@/hooks/useReportPreview";
import { PDFPreviewDialog } from "@/components/reports/pdf-preview-dialog";
import { format } from "date-fns";
import type { RoleDistributionFilters } from "@/lib/actions/reports/hr-reports";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active Only" },
  { value: "banned", label: "Banned Only" },
];

interface RoleDistributionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RoleDistributionDialog({
  open,
  onClose,
}: RoleDistributionDialogProps) {
  const { mutate: generateReport, isPending } = useRoleDistributionReport();
  const { pdfData, isPreviewOpen, openPreview, setPreviewOpen } =
    useReportPreview();

  const { handleSubmit, control, reset } = useForm<RoleDistributionFilters>({
    defaultValues: {
      status: "all",
    },
  });

  const onSubmit: SubmitHandler<RoleDistributionFilters> = (values) => {
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

  const filename = `role-distribution-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Role Distribution Report</DialogTitle>
            <DialogDescription>
              Generate a PDF report showing employee breakdown by role
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Employee Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
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
        title="Role Distribution Report"
      />
    </>
  );
}
