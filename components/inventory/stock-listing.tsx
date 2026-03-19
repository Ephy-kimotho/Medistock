"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useStockInventory, useMedicineNames } from "@/hooks/useStockInventory";
import { StockSearch } from "./stock-search";
import { StockTable } from "./stock-table";
import { EmptyState } from "./empty-state";
import { Footer } from "@/components/footer";
import { Loader } from "lucide-react";

interface StockListingProps {
  initialSearch: string;
  initialMedicineId: string;
  initialStatus: string;
  currentPage: number;
}

export function StockListing({
  initialSearch,
  initialMedicineId,
  initialStatus,
  currentPage,
}: StockListingProps) {
  const router = useRouter();
  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();

  // Local state for form inputs (before applying)
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [medicineFilter, setMedicineFilter] = useState(initialMedicineId);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const { data: medicines } = useMedicineNames();
  const { data, isLoading } = useStockInventory({
    page: currentPage,
    search: initialSearch,
    medicineId: initialMedicineId,
    status: initialStatus,
  });

  const applyFilters = () => {
    const urlParams = new URLSearchParams();
    urlParams.set("page", "1");

    if (searchValue.trim()) {
      urlParams.set("search", searchValue.trim());
    }

    if (medicineFilter !== "all") {
      urlParams.set("medicine", medicineFilter);
    }

    if (statusFilter !== "all") {
      urlParams.set("status", statusFilter);
    }

    startApplyTransition(() => {
      router.push(`/inventory?${urlParams.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearchValue("");
    setMedicineFilter("all");
    setStatusFilter("all");

    startClearTransition(() => {
      router.push("/inventory?page=1");
    });
  };

  const hasFilters =
    initialSearch !== "" ||
    initialMedicineId !== "all" ||
    initialStatus !== "all";

  return (
    <>
      {/* Search and Filters */}
      <StockSearch
        searchValue={searchValue}
        medicineFilter={medicineFilter}
        statusFilter={statusFilter}
        medicines={medicines ?? []}
        onSearchChange={setSearchValue}
        onMedicineChange={setMedicineFilter}
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
                Loading stock inventory...
              </p>
            </div>
          </div>
        ) : !data || data.stocks.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <StockTable stocks={data.stocks} />
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 0 && (
        <Footer
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          hasNext={data.hasNext}
          hasPrev={data.hasPrev}
          preserveParams={["search", "medicine", "status"]}
        />
      )}
    </>
  );
}
