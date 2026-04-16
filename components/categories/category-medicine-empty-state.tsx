"use client";

import { Button } from "@/components/ui/button";
import { SearchX, Pill, } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className={cn(
          "size-16 rounded-full flex items-center justify-center mb-4",
          search ? "bg-lipstick-red/10" : "bg-azure/10",
        )}
      >
        {search ? (
          <SearchX className="size-6 text-lipstick-red" />
        ) : (
          <Pill className="size-6 text-azure" />
        )}
      </div>
      {search ? (
        <>
          <h3 className="text-lg font-semibold text-slate-900">
            No medicines found
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            No medicines match &quot;{search}&quot; in this category
          </p>
          <Button
            className="px-10 bg-lipstick-red hover:bg-crimson-red"
            onClick={onClear}
          >
            Clear search
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-slate-900">
            No medicines yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add your first medicine to this category to get started
          </p>
        </>
      )}
    </div>
  );
}
