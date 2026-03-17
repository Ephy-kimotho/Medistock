"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Archive,
  ArchiveRestore,
  Check,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { EditMedicineForm } from "./edit-medicine";
import { Alert } from "@/components/alert";
import { useArchiveMedicine, useRestoreMedicine } from "@/hooks/useMedicines";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import type { MedicineWithStock } from "@/lib/types";

interface MedicineTableProps {
  medicines: MedicineWithStock[];
}

export function MedicineTable({ medicines }: MedicineTableProps) {
  const { isAdmin, isInventoryManager } = usePermissions();

  // Edit medicine dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] =
    useState<MedicineWithStock | null>(null);

  // Archive/Restore dialog state
  const [archiveRestoreDialogOpen, setArchiveRestoreDialogOpen] =
    useState(false);
  const [medicineToToggle, setMedicineToToggle] =
    useState<MedicineWithStock | null>(null);

  const { mutate: archiveMedicine, isPending: isArchiving } =
    useArchiveMedicine();
  const { mutate: restoreMedicine, isPending: isRestoring } =
    useRestoreMedicine();

  const isAdminOrManager = isAdmin || isInventoryManager;

  const handleArchiveRestoreClick = (medicine: MedicineWithStock) => {
    setMedicineToToggle(medicine);
    setArchiveRestoreDialogOpen(true);
  };

  const handleArchiveRestoreConfirm = () => {
    if (!medicineToToggle) return;

    if (medicineToToggle.isActive) {
      // Archive the medicine
      archiveMedicine(medicineToToggle.id, {
        onSuccess: () => {
          setArchiveRestoreDialogOpen(false);
          setMedicineToToggle(null);
        },
      });
    } else {
      // Restore the medicine
      restoreMedicine(medicineToToggle.id, {
        onSuccess: () => {
          setArchiveRestoreDialogOpen(false);
          setMedicineToToggle(null);
        },
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Check className="size-4 text-medium-jungle" />;
      case "low_stock":
        return <AlertCircle className="size-4 text-princeton-orange" />;
      case "out_of_stock":
        return <XCircle className="size-4 text-crimson-red" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_stock":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      default:
        return status;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "in_stock":
        return "text-medium-jungle";
      case "low_stock":
        return "text-princeton-orange";
      case "out_of_stock":
        return "bg-red-50 text-crimson-red";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="font-semibold">Medicine Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Unit</TableHead>
              <TableHead className="font-semibold text-center">
                Total Stock
              </TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              {isAdminOrManager && (
                <TableHead className="font-semibold text-center">
                  Active Status
                </TableHead>
              )}
              {isAdminOrManager && (
                <TableHead className="font-semibold text-center">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.map((medicine) => (
              <TableRow
                key={medicine.id}
                className={cn(!medicine.isActive && "bg-muted/50 opacity-75")}
              >
                <TableCell className="font-medium capitalize">
                  {medicine.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {medicine.categoryName}
                </TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {medicine.unit}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {medicine.totalStock}
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium",
                      getStatusStyles(medicine.stockStatus),
                    )}
                  >
                    {getStatusIcon(medicine.stockStatus)}
                    <span>{getStatusLabel(medicine.stockStatus)}</span>
                  </div>
                </TableCell>

                {/* Active Status Badge */}
                {isAdminOrManager && (
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "px-3 py-1",
                        medicine.isActive
                          ? "bg-medium-jungle/10 text-medium-jungle border-medium-jungle"
                          : "bg-princeton-orange/10 text-princeton-orange border-princeton-orange",
                      )}
                    >
                      {medicine.isActive ? "Active" : "Archived"}
                    </Badge>
                  </TableCell>
                )}

                {/* Actions */}
                {isAdminOrManager && (
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="size-8 p-0 hover:bg-muted"
                        >
                          <MoreVertical className="size-4 text-muted-foreground" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          disabled={!medicine.isActive}
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4 text-muted-foreground" />
                          <span>Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className={cn(
                            "flex items-center gap-2 cursor-pointer",
                            medicine.isActive
                              ? "text-princeton-orange focus:text-princeton-orange focus:bg-princeton-orange/10"
                              : "text-medium-jungle focus:text-medium-jungle focus:bg-medium-jungle/10",
                          )}
                          onClick={() => handleArchiveRestoreClick(medicine)}
                        >
                          {medicine.isActive ? (
                            <>
                              <Archive className="size-4" />
                              <span>Archive</span>
                            </>
                          ) : (
                            <>
                              <ArchiveRestore className="size-4" />
                              <span>Restore</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedMedicine && (
        <EditMedicineForm
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          medicine={selectedMedicine}
        />
      )}

      {/* Archive/Restore Confirmation Dialog */}
      {medicineToToggle && (
        <Alert
          open={archiveRestoreDialogOpen}
          onOpenChange={setArchiveRestoreDialogOpen}
          title={
            medicineToToggle.isActive ? "Archive Medicine" : "Restore Medicine"
          }
          description={
            medicineToToggle.isActive
              ? `Are you sure you want to archive "${medicineToToggle.name}"? Archived medicines are hidden from regular users.`
              : `Are you sure you want to restore "${medicineToToggle.name}"? This will make it visible to all users again.`
          }
          action={medicineToToggle.isActive ? "Archive" : "Restore"}
          actionFn={handleArchiveRestoreConfirm}
          actionType={medicineToToggle.isActive ? "warn" : "info"}
          isLoading={isArchiving || isRestoring}
        />
      )}
    </>
  );
}
