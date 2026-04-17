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
import { useRoleDistributionReport } from "@/hooks/useReports";
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

  const { handleSubmit, control, reset } = useForm<RoleDistributionFilters>({
    defaultValues: {
      status: "all",
    },
  });

  const onSubmit: SubmitHandler<RoleDistributionFilters> = (values) => {
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
