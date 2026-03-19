"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useCategories } from "@/hooks/useCategories";
import { CategorySearch } from "./category-search";
import { CategoriesTable } from "./categories-table";
import { EmptyState } from "@/components/categories/empyt-state";
import { Footer } from "@/components/footer";
import { Loader } from "lucide-react";

interface CategoryListingProps {
  initialSearch: string;
  currentPage: number;
}

export function CategoriesListing({
  initialSearch,
  currentPage,
}: CategoryListingProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);

  const { data, isLoading } = useCategories({
    page: currentPage,
    search: initialSearch,
  });

  const debouncedUpdateURL = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");

    const trimedValue = value.trim();

    if (trimedValue) {
      params.set("search", trimedValue);
    }

    startTransition(() => {
      router.push(`/inventory/categories?${params.toString()}`);
    });
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedUpdateURL(value);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    startTransition(() => router.push("/inventory/categories?page=1"));
  };

  if (!data) {
    return <EmptyState search="" onClear={handleClearSearch} />;
  }

  return (
    <div className="flex-1 flex flex-col gap-5">
      <div className="space-y-4 flex-1 mb-4">
        <CategorySearch
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
                  Loading categories...
                </p>
              </div>
            </div>
          ) : data?.categories.length === 0 ? (
            <EmptyState search={initialSearch} onClear={handleClearSearch} />
          ) : (
            <CategoriesTable
              categories={data?.categories || []}
              canViewArchived={data?.canViewArchived || false}
            />
          )}
        </div>
      </div>

      {/* Pagination */}
      <Footer
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        hasNext={data.hasNext}
        hasPrev={data.hasPrev}
        preserveParams={["search"]}
      />
    </div>
  );
}
