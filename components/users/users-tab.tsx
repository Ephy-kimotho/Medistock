"use client";

import { useState, useTransition } from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserRoundX, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UserTable } from "./users-table";
import { Footer } from "@/components/footer";

interface InitialFilters {
  search?: string;
  searchRole?: string;
}

interface UserTabProps {
  initialFilters: InitialFilters;
  currentPage: number;
}

function UsersTab({ initialFilters, currentPage }: UserTabProps) {
  const [isApplyTransitionPending, startApplyTransition] = useTransition();
  const [isClearTransitionPending, startClearTransition] = useTransition();

  // Local state for form inputs (before applying)
  const [userFilters, setUserFilters] =
    useState<InitialFilters>(initialFilters);

  const router = useRouter();

  // Fetch data using URL params (initialFilters), not local state
  const { data, isLoading } = useUsers({
    page: currentPage,
    search: initialFilters.search || "",
    role: initialFilters.searchRole || "all",
  });

  const isPending = isApplyTransitionPending || isClearTransitionPending;

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "users");
    params.set("page", "1");

    if (userFilters.search) {
      params.set("search", userFilters.search);
    }

    if (userFilters.searchRole && userFilters.searchRole !== "all") {
      params.set("role", userFilters.searchRole);
    }

    startApplyTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setUserFilters({
      search: "",
      searchRole: "all",
    });

    startClearTransition(() => {
      router.push("/users?tab=users&page=1");
    });
  };

  // Loading state
  if (!data || isLoading) {
    return (
      <section className="grid place-items-center py-10">
        <div className="flex flex-col items-center gap-2">
          <Loader className="size-6 text-azure animate-spin" />
          <p>Loading users...</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (data.users.length === 0) {
    return (
      <section className="grid place-items-center py-10">
        <div className="grid place-items-center text-muted-foreground">
          <UserRoundX className="size-10 mb-2" />
          <p className="text-sm">No users found.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="flex-1">
        {/* Search and filters */}
        <article className="flex flex-col gap-5 md:gap-4 my-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Input
              type="text"
              placeholder="Search by name or email..."
              className="w-full md:max-w-xl"
              disabled={isPending}
              value={userFilters.search || ""}
              onChange={(e) =>
                setUserFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />

            <Select
              value={userFilters.searchRole || "all"}
              disabled={isPending}
              onValueChange={(value) => {
                setUserFilters((prev) => ({ ...prev, searchRole: value }));
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

        <UserTable users={data.users} />
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

export { UsersTab };
