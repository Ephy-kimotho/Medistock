"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  useTransactions,
  useTransactionMedicines,
  useTransactionUsers,
} from "@/hooks/useTransactions";
import { TransactionSearch } from "./transaction-search";
import { TransactionTable } from "./transaction-table";
import { EmptyState } from "./empty-state";
import { Footer } from "@/components/footer";
import { Loader } from "lucide-react";

interface TransactionListingProps {
  initialSearch: string;
  initialType: string;
  initialMedicineId: string;
  initialUserId: string;
  initialFromDate: string;
  initialToDate: string;
  currentPage: number;
  isAdmin: boolean;
}

export function TransactionListing({
  initialSearch,
  initialType,
  initialMedicineId,
  initialUserId,
  initialFromDate,
  initialToDate,
  currentPage,
  isAdmin,
}: TransactionListingProps) {
  const router = useRouter();
  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();

  // Local state for form inputs
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [medicineFilter, setMedicineFilter] = useState(initialMedicineId);
  const [userFilter, setUserFilter] = useState(initialUserId);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    initialFromDate ? new Date(initialFromDate) : undefined,
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    initialToDate ? new Date(initialToDate) : undefined,
  );

  const { data: medicines } = useTransactionMedicines();
  const { data: users } = useTransactionUsers();
  const { data, isLoading } = useTransactions({
    page: currentPage,
    search: initialSearch,
    type: initialType,
    medicineId: initialMedicineId,
    userId: initialUserId,
    fromDate: initialFromDate,
    toDate: initialToDate,
  });

  const applyFilters = () => {
    const urlParams = new URLSearchParams();
    urlParams.set("page", "1");

    if (searchValue.trim()) {
      urlParams.set("search", searchValue.trim());
    }

    if (typeFilter !== "all") {
      urlParams.set("type", typeFilter);
    }

    if (medicineFilter !== "all") {
      urlParams.set("medicine", medicineFilter);
    }

    if (isAdmin && userFilter !== "all") {
      urlParams.set("user", userFilter);
    }

    if (fromDate) {
      urlParams.set("from", format(fromDate, "yyyy-MM-dd"));
    }

    if (toDate) {
      urlParams.set("to", format(toDate, "yyyy-MM-dd"));
    }

    startApplyTransition(() => {
      router.push(`/transactions?${urlParams.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearchValue("");
    setTypeFilter("all");
    setMedicineFilter("all");
    setUserFilter("all");
    setFromDate(undefined);
    setToDate(undefined);

    startClearTransition(() => {
      router.push("/transactions?page=1");
    });
  };

  const hasFilters =
    initialSearch !== "" ||
    initialType !== "all" ||
    initialMedicineId !== "all" ||
    initialUserId !== "all" ||
    initialFromDate !== "" ||
    initialToDate !== "";

  return (
    <>
      {/* Search and Filters */}
      <TransactionSearch
        searchValue={searchValue}
        typeFilter={typeFilter}
        medicineFilter={medicineFilter}
        userFilter={userFilter}
        fromDate={fromDate}
        toDate={toDate}
        medicines={medicines ?? []}
        users={users ?? []}
        isAdmin={isAdmin}
        onSearchChange={setSearchValue}
        onTypeChange={setTypeFilter}
        onMedicineChange={setMedicineFilter}
        onUserChange={setUserFilter}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
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
                Loading transactions...
              </p>
            </div>
          </div>
        ) : !data || data.transactions.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <TransactionTable transactions={data.transactions} />
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 0 && (
        <Footer
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          hasNext={data.hasNext}
          hasPrev={data.hasPrev}
          preserveParams={["search", "type", "medicine", "user", "from", "to"]}
        />
      )}
    </>
  );
}
