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
import { MoreVertical, Pencil, Archive, ArchiveRestore } from "lucide-react";
import { EditCategoryForm } from "@/components/categories/category-edit-dialog";
import { Alert } from "@/components/alert";
import { useArchiveCategory, useRestoreCategory } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoriesTableProps {
  categories: Category[];
  canViewArchived: boolean;
}

export function CategoriesTable({
  categories,
  canViewArchived,
}: CategoriesTableProps) {
  // Edit category dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // Archive/Restore dialog state
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [categoryToArchive, setCategoryToArchive] = useState<Category | null>(
    null,
  );

  const { mutate: archiveCategory, isPending: isArchiving } =
    useArchiveCategory();
  const { mutate: restoreCategory, isPending: isRestoring } =
    useRestoreCategory();

  const handleArchiveClick = (category: Category) => {
    setCategoryToArchive(category);
    setArchiveDialogOpen(true);
  };

  const handleArchiveConfirm = () => {
    if (!categoryToArchive) return;

    if (categoryToArchive.isArchived) {
      restoreCategory(categoryToArchive.id, {
        onSuccess: () => {
          setArchiveDialogOpen(false);
          setCategoryToArchive(null);
        },
      });
    } else {
      archiveCategory(categoryToArchive.id, {
        onSuccess: () => {
          setArchiveDialogOpen(false);
          setCategoryToArchive(null);
        },
      });
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold text-center">
                Medicine count
              </TableHead>
              <TableHead className="font-semibold text-center">
                Current stock
              </TableHead>
              {canViewArchived && (
                <TableHead className="font-semibold text-center">
                  Status
                </TableHead>
              )}
              <TableHead className="font-semibold text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow
                key={category.id}
                className={cn(category.isArchived && "bg-muted/50 opacity-75")}
              >
                <TableCell className="font-medium capitalize">
                  {category.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {category.description || "—"}
                </TableCell>
                <TableCell className="text-center font-bold">
                  {category.medicineCount ?? 0}
                </TableCell>
                <TableCell className="text-center font-bold">
                  {category.totalStock ?? 0}
                </TableCell>
                {/* Status badge - only for admin/inventory_manager */}
                {canViewArchived && (
                  <TableCell className="text-center">
                    <Badge
                      variant={category.isArchived ? "secondary" : "default"}
                      className={cn(
                        "px-3 py-1",
                        category.isArchived
                          ? "bg-princeton-orange/10 text-princeton-orange border-princeton-orange"
                          : "bg-medium-jungle/10 text-medium-jungle border-medium-jungle",
                      )}
                    >
                      {category.isArchived ? "Archived" : "Active"}
                    </Badge>
                  </TableCell>
                )}
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

                      {/* Edit - Action */}
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        disabled={category.isArchived}
                        onClick={() => {
                          setSelectedCategory(category);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-4 text-muted-foreground" />
                        <span>Edit</span>
                      </DropdownMenuItem>

                      {/* Archive/Restore - only for admin and inventory managers */}
                      {canViewArchived && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={cn(
                              "flex items-center gap-2 cursor-pointer",
                              category.isArchived
                                ? "text-medium-jungle focus:text-medium-jungle focus:bg-medium-jungle/10"
                                : "text-princeton-orange focus:text-princeton-orange focus:bg-princeton-orange/10",
                            )}
                            onClick={() => handleArchiveClick(category)}
                          >
                            {category.isArchived ? (
                              <>
                                <ArchiveRestore className="size-4" />
                                <span>Restore</span>
                              </>
                            ) : (
                              <>
                                <Archive className="size-4" />
                                <span>Archive</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedCategory && (
        <EditCategoryForm
          open={editDialogOpen}
          category={selectedCategory}
          setOpen={setEditDialogOpen}
          setSelectedCategory={setSelectedCategory}
        />
      )}

      {/* Archive/Restore Confirmation Dialog */}
      {categoryToArchive && (
        <Alert
          open={archiveDialogOpen}
          onOpenChange={setArchiveDialogOpen}
          title={
            categoryToArchive.isArchived
              ? "Restore Category"
              : "Archive Category"
          }
          description={
            categoryToArchive.isArchived
              ? `Are you sure you want to restore "${categoryToArchive.name}"? This will make it visible to all users again.`
              : `Are you sure you want to archive "${categoryToArchive.name}"? Archived categories are hidden from regular users.`
          }
          action={categoryToArchive.isArchived ? "Restore" : "Archive"}
          actionFn={handleArchiveConfirm}
          actionType={categoryToArchive.isArchived ? "info" : "warn"}
          isLoading={isArchiving || isRestoring}
        />
      )}
    </>
  );
}
