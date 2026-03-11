"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvitationsSearchProps {
  searchValue: string;
  roleFilter: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function InvitationsSearch({
  searchValue,
  roleFilter,
  onSearchChange,
  onRoleChange,
  onClear,
  isLoading,
}: InvitationsSearchProps) {
  const hasFilters = searchValue !== "" || roleFilter !== "all";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "px-12 py-2  text-base",
            "focus-visible:ring-azure focus-visible:border-azure",
          )}
        />
        {searchValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader className="size-5 text-muted-foreground animate-spin" />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-slate-100"
                onClick={() => onSearchChange("")}
              >
                <X className="size-4 text-muted-foreground" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Role Filter */}
      <Select value={roleFilter} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full sm:w-48 h-12">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Administrator</SelectItem>
          <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
          <SelectItem value="user">Pharmacist</SelectItem>
          <SelectItem value="auditor">Auditor</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" className="h-12 px-6" onClick={onClear}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
