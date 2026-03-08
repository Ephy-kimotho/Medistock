import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function CategorySearch({
  value,
  isLoading,
  onChange,
  onClear,
}: CategorySearchProps) {
  return (
    <div className="relative max-w-xl md:max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="search categories . . ."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("pl-12 pr-12 h-12 text-base", "focus-visible:ring-azure")}
      />
      {/* Loading indicator or clear button */}
      {value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader className="size-5 text-muted-foreground animate-spin" />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-slate-100"
              onClick={onClear}
            >
              <X className="size-4 text-muted-foreground" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
