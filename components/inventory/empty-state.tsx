"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters: boolean;
  onClear: () => void;
}

export function EmptyState({ hasFilters, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Package className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        {hasFilters ? "No batches found" : "No stock batches yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Start by adding your first stock batch to the inventory."}
      </p>
      {hasFilters && (
        <Button variant="outline" className="mt-4" onClick={onClear}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
