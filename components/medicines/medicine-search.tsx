"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StockStatus, CategoryInfo } from "@/lib/types";

interface MedicineSearchProps {
  searchValue: string;
  categoryFilter: string;
  statusFilter: StockStatus;
  categories: CategoryInfo;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: StockStatus) => void;
  onApply: () => void;
  onClear: () => void;
  isApplying?: boolean;
  isClearing?: boolean;
}

export function MedicineSearch({
  searchValue,
  categoryFilter,
  statusFilter,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onApply,
  onClear,
  isApplying,
  isClearing,
}: MedicineSearchProps) {
  const isPending = isApplying || isClearing;

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search medicines..."
            value={searchValue}
            disabled={isPending}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-10 h-10",
              "focus-visible:ring-azure focus-visible:border-azure",
            )}
          />
        </div>

        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onValueChange={onCategoryChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-48 h-10">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={onStatusChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-40 h-10">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        <Button
          size="lg"
          className="px-10 bg-azure hover:bg-blue-600"
          disabled={isPending}
          onClick={onApply}
        >
          {isApplying ? (
            <span className="inline-flex items-center gap-2">
              <Loader className="size-4 animate-spin" />
              Applying...
            </span>
          ) : (
            "Apply Filters"
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="px-8 text-white hover:text-white bg-crimson-red hover:bg-lipstick-red"
          disabled={isPending}
          onClick={onClear}
        >
          {isClearing ? (
            <span className="inline-flex items-center gap-2">
              <Loader className="size-4 animate-spin" />
              Clearing...
            </span>
          ) : (
            "Clear Filters"
          )}
        </Button>
      </div>
    </div>
  );
}
