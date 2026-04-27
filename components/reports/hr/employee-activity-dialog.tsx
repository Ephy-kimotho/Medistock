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
  useEmployeeActivityReport,
  useEmployeesForReport,
} from "@/hooks/useReports";
import { useReportPreview } from "@/hooks/useReportPreview";
import { PDFPreviewDialog } from "@/components/reports/pdf-preview-dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { EmployeeActivityFilters } from "@/lib/actions/reports/hr-reports";

const TRANSACTION_TYPES = [
  { value: "all", label: "All Types" },
  { value: "dispensed", label: "Dispense" },
  { value: "stock_in", label: "Stock In" },
  { value: "wastage", label: "Wastage" },
];

interface FormValues {
  employeeId: string;
  transactionType: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface EmployeeActivityDialogProps {
  open: boolean;
  onClose: () => void;
}

export function EmployeeActivityDialog({
  open,
  onClose,
}: EmployeeActivityDialogProps) {
  const { mutate: generateReport, isPending } = useEmployeeActivityReport();
  const { data: employees = [], isLoading: isLoadingEmployees } =
    useEmployeesForReport();
  const { pdfData, isPreviewOpen, openPreview, setPreviewOpen } =
    useReportPreview();

  const { handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: {
      employeeId: "all",
      transactionType: "all",
      dateFrom: undefined,
      dateTo: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const filters: EmployeeActivityFilters = {
      employeeId: values.employeeId,
      transactionType: values.transactionType,
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

  const filename = `employee-activity-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Employee Activity Report</DialogTitle>
            <DialogDescription>
              Generate a PDF report of employee transactions and activity
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Employee Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Employee</Label>
              <Controller
                control={control}
                name="employeeId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending || isLoadingEmployees}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                          {employee.employeeId && (
                            <span className="text-muted-foreground ml-2">
                              ({employee.employeeId})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Transaction Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transaction Type</Label>
              <Controller
                control={control}
                name="transactionType"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
        title="Employee Activity Report"
      />
    </>
  );
}
