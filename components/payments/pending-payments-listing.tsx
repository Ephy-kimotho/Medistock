// components/payments/pending-payments-listing.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader, CreditCard } from "lucide-react";
import { PendingPaymentsTable } from "./pending-payments-table";
import { AddPaymentDialog } from "./add-payment-dialog";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import type { PendingPayment, PendingPaymentsResponse } from "@/lib/types";

interface PendingPaymentsListingProps {
  data: PendingPaymentsResponse;
  searchTerm: string;
}

export function PendingPaymentsListing({
  data,
  searchTerm,
}: PendingPaymentsListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  // Add Payment Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(
    null,
  );

  const handleSearch = () => {
    setIsSearching(true);
    const params = new URLSearchParams(searchParams.toString());

    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    router.push(`/transactions/pending-payments?${params.toString()}`);
    setIsSearching(false);
  };

  const handleClear = () => {
    setSearchValue("");
    router.push("/transactions/pending-payments");
  };

  const handleAddPayment = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by patient, phone, or medicine..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={isSearching}
            className={cn(
              "pl-10 w-64 md:w-80 lg:w-96",
              "focus-visible:ring-azure focus-visible:border-azure",
            )}
          />
        </div>
        <Button
          className="bg-azure hover:bg-blue-600 text-white px-8"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? <Loader className="size-4 animate-spin" /> : "Search"}
        </Button>
        {searchTerm && (
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isSearching}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Content */}
      {data.payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
          <div className="size-16 rounded-full bg-azure/10 flex items-center justify-center mb-4">
            <CreditCard className="size-6 text-azure" />
          </div>
          {searchTerm ? (
            <>
              <h3 className="text-lg font-semibold text-slate-900">
                No pending payments found
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                No pending payments match &quot;{searchTerm}&quot;
              </p>
              <Button variant="outline" onClick={handleClear}>
                Clear search
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-slate-900">
                All caught up!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                No pending payments at the moment
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="mb-4">
            <PendingPaymentsTable
              payments={data.payments}
              onAddPayment={handleAddPayment}
            />
          </div>

          {/* Spacer to push footer to bottom */}
          <div className="flex-1" />

          {/* Pagination */}
          <Footer
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            hasNext={data.hasNext}
            hasPrev={data.hasPrev}
            preserveParams={["search"]}
          />
        </>
      )}

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        transaction={selectedPayment}
      />
    </div>
  );
}
