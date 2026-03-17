import { Button } from "@/components/ui/button";
import { Pill } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
  onClear: () => void;
}

export function EmptyState({ hasFilters, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Pill className="size-8 text-slate-400" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="text-lg font-semibold text-slate-900">
            No medicines found
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            No medicines match your current filters
          </p>
          <Button variant="outline" onClick={onClear}>
            Clear Filters
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-slate-900">
            No medicines yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first medicine to get started
          </p>
        </>
      )}
    </div>
  );
}
