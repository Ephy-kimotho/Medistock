"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useMedicines,
  useMedicineCategories,
} from "@/hooks/useMedicines";
import { MedicineSearch } from "./medicine-search";
import { MedicineTable } from "./medicine-table";
import { EmptyState } from "./empty-state";
import { Footer } from "@/components/footer";
import { Loader } from "lucide-react";
import type { StockStatus } from "@/lib/types";

interface MedicineListingProps {
  initialSearch: string;
  initialCategoryId: string;
  initialStatus: StockStatus;
  currentPage: number;
}

export function MedicineListing({
  initialSearch,
  initialCategoryId,
  initialStatus,
  currentPage,
}: MedicineListingProps) {
  const router = useRouter();
  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();

  // Local state for form inputs (before applying)
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryId);
  const [statusFilter, setStatusFilter] = useState<StockStatus>(initialStatus);

  const { data: categories } = useMedicineCategories();
  const { data, isLoading } = useMedicines({
    page: currentPage,
    search: initialSearch,
    categoryId: initialCategoryId,
    status: initialStatus,
  });

  const applyFilters = () => {
    const urlParams = new URLSearchParams();
    urlParams.set("page", "1");

    if (searchValue.trim()) {
      urlParams.set("search", searchValue.trim());
    }

    if (categoryFilter !== "all") {
      urlParams.set("category", categoryFilter);
    }

    if (statusFilter !== "all") {
      urlParams.set("status", statusFilter);
    }

    startApplyTransition(() => {
      router.push(`/inventory/medicines?${urlParams.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearchValue("");
    setCategoryFilter("all");
    setStatusFilter("all");

    startClearTransition(() => {
      router.push("/inventory/medicines?page=1");
    });
  };

  const hasFilters =
    initialSearch !== "" ||
    initialCategoryId !== "all" ||
    initialStatus !== "all";

  return (
    <>
      {/* Search and Filters */}
      <MedicineSearch
        searchValue={searchValue}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        categories={categories ?? []}
        onSearchChange={setSearchValue}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
        onApply={applyFilters}
        onClear={clearFilters}
        isApplying={isApplyPending}
        isClearing={isClearPending}
      />

      {/* Table */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader className="size-6 text-azure animate-spin" />
              <p className="text-sm text-muted-foreground">
                Loading medicines...
              </p>
            </div>
          </div>
        ) : !data || data.medicines.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <MedicineTable medicines={data.medicines} />
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 0 && (
        <Footer
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          hasNext={data.hasNext}
          hasPrev={data.hasPrev}
          preserveParams={["search", "category", "status"]}
        />
      )}
    </>
  );
}
