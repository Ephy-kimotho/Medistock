"use client";

import { Loader, FileDown } from "lucide-react";
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
import { useEmployeeDirectoryReport } from "@/hooks/useReports";
import type { EmployeeDirectoryFilters } from "@/lib/actions/reports/hr-reports";

const ROLES = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "inventory_manager", label: "Inventory Manager" },
  { value: "hr", label: "HR" },
  { value: "auditor", label: "Auditor" },
  { value: "user", label: "Pharmacist" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];

interface EmployeeDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function EmployeeDirectoryDialog({
  open,
  onClose,
}: EmployeeDirectoryDialogProps) {
  const { mutate: generateReport, isPending } = useEmployeeDirectoryReport();

  const { handleSubmit, control, reset } = useForm<EmployeeDirectoryFilters>({
    defaultValues: {
      role: "all",
      status: "all",
    },
  });

  const onSubmit: SubmitHandler<EmployeeDirectoryFilters> = (values) => {
    generateReport(values, {
      onSuccess: (result) => {
        if (result.success) {
          handleClose();
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

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Directory Report</DialogTitle>
          <DialogDescription>
            Generate a PDF report of all employees with their details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Role Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
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
                  <FileDown className="size-4" />
                  Download PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
