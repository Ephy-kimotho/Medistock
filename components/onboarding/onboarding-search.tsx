"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function OnboardingSearch({
  value,
  onChange,
  onClear,
  isLoading,
}: OnboardingSearchProps) {
  return (
    <div className="relative max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by name, email, or employee ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "pl-12 pr-12 h-12 text-base",
          "focus-visible:ring-azure focus-visible:border-azure"
        )}
      />
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