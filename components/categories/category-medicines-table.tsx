import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getAgeGroupLabel } from "@/constants";
import { cn } from "@/lib/utils";

interface CategoryMedicine {
  id: string;
  name: string;
  unit: string;
  reorderlevel: number;
  ageGroup: string;
  manufacturer: string | null;
  totalStock: number;
}

interface CategoryMedicinesTableProps {
  medicines: CategoryMedicine[];
  canManageStock: boolean;
  onAddStock: (medicineId: string, medicineName: string) => void;
}

export function CategoryMedicinesTable({
  medicines,
  canManageStock,
  onAddStock,
}: CategoryMedicinesTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Age Group</TableHead>
            <TableHead className="font-semibold">Unit</TableHead>
            <TableHead className="font-semibold text-center">
              Total Stock
            </TableHead>
            <TableHead className="font-semibold text-center">
              Reorder Level
            </TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            {canManageStock && (
              <TableHead className="font-semibold text-center">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicines.map((medicine) => {
            const isLowStock =
              medicine.totalStock > 0 &&
              medicine.totalStock <= medicine.reorderlevel;
            const isOutOfStock = medicine.totalStock === 0;

            return (
              <TableRow key={medicine.id}>
                <TableCell className="font-medium capitalize">
                  {medicine.name}
                </TableCell>
                <TableCell>{getAgeGroupLabel(medicine.ageGroup)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {medicine.unit}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {medicine.totalStock}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {medicine.reorderlevel}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      "px-3 py-1",
                      isOutOfStock &&
                        "bg-crimson-red/10 text-crimson-red border-crimson-red",
                      isLowStock &&
                        "bg-princeton-orange/10 text-princeton-orange border-princeton-orange",
                      !isOutOfStock &&
                        !isLowStock &&
                        "bg-medium-jungle/10 text-medium-jungle border-medium-jungle",
                    )}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : isLowStock
                        ? "Low Stock"
                        : "In Stock"}
                  </Badge>
                </TableCell>
                {canManageStock && (
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 hover:bg-azure hover:text-white hover:border-azure"
                      onClick={() => onAddStock(medicine.id, medicine.name)}
                    >
                      <Plus className="size-4" />
                      Add Stock
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
