"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useInvitationRequests } from "@/hooks/useInvitationRequests";
import { usePermissions } from "@/hooks/usePermissions";
import { OnboardingSearch } from "./onboarding-search";
import { OnboardingTable } from "./onboarding-table";
import { InvitationRequestForm } from "./invitation-request-form";
import { EmptyState } from "./empty-state";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Plus, Loader } from "lucide-react";

interface OnboardingListingProps {
  initialSearch: string;
  currentPage: number;
  userId: string;
  email:string
}

export function OnboardingListing({
  initialSearch,
  currentPage,
  email,
  userId,
}: OnboardingListingProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);

  const { canCreateRequests } = usePermissions();

  const { data, isLoading } = useInvitationRequests({
    page: currentPage,
    search: initialSearch,
    email
  });

  const debouncedUpdateURL = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");

    const trimmedValue = value.trim();
    if (trimmedValue) {
      params.set("search", trimmedValue);
    }

    startTransition(() => {
      router.push(`/onboarding?${params.toString()}`);
    });
  }, 600);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedUpdateURL(value);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    startTransition(() => router.push("/onboarding?page=1"));
  };

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 md:justify-between mb-5">
        <div>
          <h2 className="text-2xl text-slate-900 font-bold">
            Employee Onboarding
          </h2>
          <p className="text-muted-foreground">
            Manage employee invitation requests
          </p>
        </div>

        {canCreateRequests && (
          <InvitationRequestForm requestorId={userId}>
            <Button className="h-11 px-8 text-white bg-azure self-start hover:bg-blue-600 inline-flex items-center gap-2">
              <Plus className="size-4 text-white" />
              New Request
            </Button>
          </InvitationRequestForm>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 space-y-4">
        <OnboardingSearch
          value={searchValue}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          isLoading={isPending}
        />

        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader className="size-6 text-azure animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading requests...
                </p>
              </div>
            </div>
          ) : !data || data.requests.length === 0 ? (
            <EmptyState search={initialSearch} onClear={handleClearSearch} />
          ) : (
            <OnboardingTable requests={data.requests} invitorId={userId} />
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
          preserveParams={["search"]}
        />
      )}
    </>
  );
}
