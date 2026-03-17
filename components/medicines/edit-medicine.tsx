"use client";

import { useMedicineCategories } from "@/hooks/useMedicines";
import { MedicineForm } from "./medicine-form";
import type { MedicineWithStock } from "@/lib/types";

interface EditMedicineFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  medicine: MedicineWithStock;
}

export function EditMedicineForm({
  open,
  setOpen,
  medicine,
}: EditMedicineFormProps) {
  const { data, isLoading } = useMedicineCategories();

  // Don't render anything if categories aren't loaded yet
  if (isLoading || !data) {
    return null;
  }

  return (
    <MedicineForm
      open={open}
      setOpen={setOpen}
      isEditing={true}
      categoryInfo={data}
      initialValues={{
        id: medicine.id,
        name: medicine.name,
        unit: medicine.unit,
        reorderlevel: medicine.reorderlevel,
        categoryId: medicine.categoryId,
        manufacturer: medicine.manufacturer ?? "",
      }}
    />
  );
}
