import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface EmptyStateProps {
  search: string;
  onClear: () => void;
}

export function EmptyState({ search, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <UserPlus className="size-8 text-slate-400" />
      </div>
      {search ? (
        <>
          <h3 className="text-lg font-semibold text-slate-900">
            No requests found
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            No invitation requests match &quot;{search}&quot;
          </p>
          <Button variant="outline" onClick={onClear}>
            Clear search
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-slate-900">
            No invitation requests yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first invitation request to get started
          </p>
        </>
      )}
    </div>
  );
}
