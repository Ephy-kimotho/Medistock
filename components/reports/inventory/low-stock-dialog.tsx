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
import { useLowStockReport, useCategoriesForReport } from "@/hooks/useReports";
import type { LowStockFilters } from "@/lib/actions/reports/inventory-reports";

interface LowStockDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LowStockDialog({ open, onClose }: LowStockDialogProps) {
  const { mutate: generateReport, isPending } = useLowStockReport();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategoriesForReport();

  const { handleSubmit, control, reset } = useForm<LowStockFilters>({
    defaultValues: {
      categoryId: "all",
    },
  });

  const onSubmit: SubmitHandler<LowStockFilters> = (values) => {
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
          <DialogTitle>Low Stock Alert Report</DialogTitle>
          <DialogDescription>
            Generate a PDF report of medicines below their reorder level
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
