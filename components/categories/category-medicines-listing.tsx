"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader } from "lucide-react";
import { CategoryMedicinesTable } from "./category-medicines-table";
import { AddStockForm } from "@/components/inventory/add-stock";
import { Footer } from "@/components/footer";
import { EmptyState } from "@/components/categories/category-medicine-empty-state";
import { cn } from "@/lib/utils";
import type { CategoryMedicinesListingProps } from "@/lib/types";

interface Props extends Omit<CategoryMedicinesListingProps, "categoryName"> {
  categoryId: string;
  userId: string;
  canManageStock: boolean;
}

export function CategoryMedicinesListing({
  categoryId,
  medicines,
  totalPages,
  currentPage,
  hasNext,
  hasPrev,
  searchTerm,
  userId,
  canManageStock,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchTerm);
  const [isSearching, startSearchTransition] = useTransition();

  // Add Stock dialog state
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSearch = () => {
    startSearchTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }

      params.set("page", "1");
      router.push(`/inventory/categories/${categoryId}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearchValue("");
    startSearchTransition(() => {
      router.push(`/inventory/categories/${categoryId}`);
    });
  };

  const handleAddStock = (medicineId: string, medicineName: string) => {
    setSelectedMedicine({ id: medicineId, name: medicineName });
    setStockDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search medicines..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={isSearching}
            className={cn(
              "pl-10 w-64 md:w-72 lg:w-80",
              "focus-visible:ring-azure focus-visible:border-azure",
            )}
          />
        </div>
        <Button
          className="bg-azure hover:bg-blue-600 text-white px-12"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            "Apply filter"
          )}
        </Button>
        {searchTerm && (
          <Button
            className="px-10 bg-lipstick-red hover:bg-crimson-red"
            onClick={handleClear}
            disabled={isSearching}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Table or Empty State */}
      {medicines.length === 0 ? (
        <EmptyState search={searchTerm} onClear={handleClear} />
      ) : (
        <>
          <CategoryMedicinesTable
            medicines={medicines}
            canManageStock={canManageStock}
            onAddStock={handleAddStock}
          />

          {/* Pagination */}
          <Footer
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            preserveParams={["search"]}
          />
        </>
      )}

      {/* Add Stock Dialog (controlled mode) */}
      {canManageStock && selectedMedicine && (
        <AddStockForm
          userId={userId}
          lockedMedicineId={selectedMedicine.id}
          lockedMedicineName={selectedMedicine.name}
          open={stockDialogOpen}
          setOpen={setStockDialogOpen}
        />
      )}
    </div>
  );
}
