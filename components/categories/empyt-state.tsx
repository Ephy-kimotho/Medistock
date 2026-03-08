import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export function EmptyState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-lipstick-red/10 rounded-full flex items-center justify-center mb-4">
        <SearchX className="size-6 text-lipstick-red" />
      </div>
      {search ? (
        <>
          <h3 className="text-lg font-semibold text-slate-900">
            No categories found
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            No categories match &quot;{search}&quot;
          </p>
          <Button variant="outline" onClick={onClear}>
            Clear search
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-slate-900">
            No categories yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first category to get started
          </p>
        </>
      )}
    </div>
  );
}
