"use client";

import { useState } from "react";
import { useMedicineCategories } from "@/hooks/useMedicines";
import { MedicineForm } from "./medicine-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MedicineFormContentSkeleton } from "./medicine-form-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

interface AddMedicineFormProps {
  children: React.ReactNode;
}

export function AddMedicineForm({ children }: AddMedicineFormProps) {
  const { data, isLoading } = useMedicineCategories();
  const [open, setOpen] = useState(false);

  // Show skeleton dialog when loading and dialog is open 
  if (isLoading || !data) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Skeleton className="h-7 w-48" />
          </DialogHeader>
          <MedicineFormContentSkeleton />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <MedicineForm
      open={open}
      setOpen={setOpen}
      isEditing={false}
      categoryInfo={data}
    >
      {children}
    </MedicineForm>
  );
}
