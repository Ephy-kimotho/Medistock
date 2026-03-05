"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useInvitations } from "@/hooks/useInvitations";
import { InvitationsTable } from "./invitations-table";
import { Inbox, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Footer } from "@/components/footer";

interface InitialFilters {
  search?: string;
  searchRole?: string;
}

interface InvitationTabProps {
  initialFilters: InitialFilters;
  currentPage: number;
}

function InvitationsTab({ initialFilters, currentPage }: InvitationTabProps) {
  const [isApplyTransitionPending, startApplyTransition] = useTransition();
  const [isClearTransitionPending, startClearTransition] = useTransition();

  // Local state for form inputs (before applying)
  const [invitationFilters, setInvitationFilters] =
    useState<InitialFilters>(initialFilters);

  const router = useRouter();

  const { data, isLoading } = useInvitations({
    page: currentPage,
    search: initialFilters.search || "",
    role: initialFilters.searchRole || "all",
  });

  const isPending = isApplyTransitionPending || isClearTransitionPending;

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "invitations");
    params.set("page", "1");

    if (invitationFilters.search) {
      params.set("search", invitationFilters.search);
    }

    if (
      invitationFilters.searchRole &&
      invitationFilters.searchRole !== "all"
    ) {
      params.set("role", invitationFilters.searchRole);
    }

    startApplyTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setInvitationFilters({
      search: "",
      searchRole: "all",
    });

    startClearTransition(() => {
      router.push("/users?tab=invitations&page=1");
    });
  };

  // Loading state
  if (!data || isLoading) {
    return (
      <section className="grid place-items-center py-10">
        <div className="flex flex-col items-center gap-2">
          <Loader className="size-6 text-azure animate-spin" />
          <p>Loading invitations...</p>
        </div>
      </section>
    );
  }

  if (data.invitations.length === 0) {
    return (
      <section className="grid place-items-center py-10">
        <div className="space-y-1 grid place-items-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-base">
            No invitations found.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="flex-1">
        {/* Search and  filters  */}
        <article className="flex flex-col gap-5 md:gap-4 my-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Input
              type="text"
              placeholder="Search by name or email..."
              className="w-full md:max-w-xl"
              disabled={isPending}
              value={invitationFilters.search || ""}
              onChange={(e) =>
                setInvitationFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }))
              }
            />

            <Select
              value={invitationFilters.searchRole || "all"}
              disabled={isPending}
              onValueChange={(value) => {
                setInvitationFilters((prev) => ({
                  ...prev,
                  searchRole: value,
                }));
              }}
            >
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="auditor">Auditors</SelectItem>
                <SelectItem value="inventory_manager">
                  Inventory Managers
                </SelectItem>
                <SelectItem value="user">Regular Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              className="cursor-pointer px-12"
              disabled={isPending}
              onClick={applyFilters}
            >
              {isApplyTransitionPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Applying...
                </span>
              ) : (
                "Apply filters"
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-10 text-white hover:text-white bg-crimson-red hover:bg-lipstick-red"
              disabled={isPending}
              onClick={clearFilters}
            >
              {isClearTransitionPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Clearing...
                </span>
              ) : (
                "Clear filters"
              )}
            </Button>
          </div>
        </article>

        <InvitationsTable invitations={data.invitations} />
      </div>

      <Footer
        currentPage={data.currentPage}
        hasNext={data.hasNext}
        hasPrev={data.hasPrev}
        totalPages={data.totalPages}
        preserveParams={["tab", "search", "role"]}
      />
    </>
  );
}

export { InvitationsTab };
