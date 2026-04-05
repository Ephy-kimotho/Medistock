"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useInvitations } from "@/hooks/useInvitations";
import { InvitationsSearch } from "./invitations-search";
import { InvitationsTable } from "./invitations-table";
import { EmptyState } from "./empty-state";
import { Footer } from "@/components/footer";
import { Loader } from "lucide-react";

interface InvitationsListingProps {
  initialSearch: string;
  initialRole: string;
  currentPage: number;
}

export function InvitationsListing({
  initialSearch,
  initialRole,
  currentPage,
}: InvitationsListingProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState(initialRole);

  const { data, isLoading } = useInvitations({
    page: currentPage,
    search: initialSearch,
    role: initialRole,
  });

  const updateURL = (params: { search?: string; role?: string }) => {
    const urlParams = new URLSearchParams();
    urlParams.set("page", "1");

    const search = params.search ?? searchValue;
    const role = params.role ?? roleFilter;

    if (search.trim()) {
      urlParams.set("search", search.trim());
    }

    if (role !== "all") {
      urlParams.set("role", role);
    }

    startTransition(() => {
      router.push(`/invitations?${urlParams.toString()}`);
    });
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateURL({ search: value });
  }, 600);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    updateURL({ role: value });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setRoleFilter("all");
    startTransition(() => router.push("/invitations?page=1"));
  };

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 md:justify-between mb-5">
        <div>
          <h2 className="text-2xl text-slate-900 font-bold">
            Employee Invitations
          </h2>
          <p className="text-muted-foreground">
            View and manage sent invitations
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 space-y-4">
        <InvitationsSearch
          searchValue={searchValue}
          roleFilter={roleFilter}
          onSearchChange={handleSearchChange}
          onRoleChange={handleRoleChange}
          onClear={handleClearFilters}
          isLoading={isPending}
        />

        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader className="size-6 text-azure animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading invitations...
                </p>
              </div>
            </div>
          ) : !data || data.invitations.length === 0 ? (
            <EmptyState
              hasFilters={initialSearch !== "" || initialRole !== "all"}
              onClear={handleClearFilters}
            />
          ) : (
            <InvitationsTable invitations={data.invitations} />
          )}
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 0 && (
        <Footer
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          hasNext={data.hasNext}
          hasPrev={data.hasPrev}
          preserveParams={["search", "role"]}
        />
      )}
    </>
  );
}
