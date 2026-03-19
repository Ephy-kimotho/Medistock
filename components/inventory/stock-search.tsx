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
import { Search, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MedicineName } from "@/lib/types";

interface StockSearchProps {
  searchValue: string;
  medicineFilter: string;
  statusFilter: string;
  medicines: MedicineName[];
  onSearchChange: (value: string) => void;
  onMedicineChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  isApplying?: boolean;
  isClearing?: boolean;
}

export function StockSearch({
  searchValue,
  medicineFilter,
  statusFilter,
  medicines,
  onSearchChange,
  onMedicineChange,
  onStatusChange,
  onApply,
  onClear,
  isApplying,
  isClearing,
}: StockSearchProps) {
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
            placeholder="Search by medicine or batch..."
            value={searchValue}
            disabled={isPending}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-10 h-10",
              "focus-visible:ring-azure focus-visible:border-azure",
            )}
          />
        </div>

        {/* Medicine Filter */}
        <Select
          value={medicineFilter}
          onValueChange={onMedicineChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-48 h-10">
            <SelectValue placeholder="All Medicines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="rounded-none cursor-pointer">
              All Medicines
            </SelectItem>
            {medicines.map((medicine) => (
              <SelectItem
                key={medicine.id}
                value={medicine.id}
                className="rounded-none cursor-pointer"
              >
                {medicine.name}
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
            <SelectItem className="rounded-none cursor-pointer" value="all">
              All Status
            </SelectItem>
            <SelectItem className="rounded-none cursor-pointer" value="good">
              Good
            </SelectItem>
            <SelectItem
              className="rounded-none cursor-pointer"
              value="expiring_soon"
            >
              Expiring Soon
            </SelectItem>
            <SelectItem className="rounded-none cursor-pointer" value="expired">
              Expired
            </SelectItem>
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
