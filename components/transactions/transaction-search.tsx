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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, CalendarIcon, Loader } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TRANSACTION_TYPES } from "@/constants";
import type { MedicineName, UserInfo } from "@/lib/types";

interface TransactionSearchProps {
  searchValue: string;
  typeFilter: string;
  medicineFilter: string;
  userFilter: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  medicines: MedicineName[];
  users: UserInfo[];
  isAdmin: boolean;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onMedicineChange: (value: string) => void;
  onUserChange: (value: string) => void;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onApply: () => void;
  onClear: () => void;
  isApplying?: boolean;
  isClearing?: boolean;
}

export function TransactionSearch({
  searchValue,
  typeFilter,
  medicineFilter,
  userFilter,
  fromDate,
  toDate,
  medicines,
  users,
  isAdmin,
  onSearchChange,
  onTypeChange,
  onMedicineChange,
  onUserChange,
  onFromDateChange,
  onToDateChange,
  onApply,
  onClear,
  isApplying,
  isClearing,
}: TransactionSearchProps) {
  const isPending = isApplying || isClearing;

  return (
    <article className="flex flex-col gap-4">
      {/* Search and Date Pickers Row */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="flex-1">
          {/* Search Input */}
          <span className="text-xs text-muted-foreground">Search Bar</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by person or medicine..."
              value={searchValue}
              disabled={isPending}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "pl-10 h-10",
                "focus-visible:ring-azure focus-visible:border-azure",
              )}
            />
          </div>
        </div>

        {/* From Date Picker */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">From Date</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isPending}
                className={cn(
                  "w-full lg:w-44 h-10 justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "dd/MM/yyyy") : "DD/MM/YYYY"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={onFromDateChange}
                disabled={(date) => (toDate ? date > toDate : false)}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To Date Picker */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">To Date</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isPending}
                className={cn(
                  "w-full lg:w-44 h-10 justify-start text-left font-normal",
                  !toDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "dd/MM/yyyy") : "DD/MM/YYYY"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={onToDateChange}
                disabled={(date) => (fromDate ? date < fromDate : false)}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Transaction Type Filter */}
        <Select
          value={typeFilter}
          onValueChange={onTypeChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full  h-10">
            <SelectValue placeholder="All Transactions" />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Medicine Filter */}
        <Select
          value={medicineFilter}
          onValueChange={onMedicineChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full  h-10">
            <SelectValue placeholder="All Medicines" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">All Medicines</SelectItem>
            {medicines.map((medicine) => (
              <SelectItem key={medicine.id} value={medicine.id}>
                {medicine.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User Filter - Admin Only */}
        {isAdmin && (
          <Select
            value={userFilter}
            onValueChange={onUserChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All Users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="lg"
          className="flex-1 sm:flex-none px-8 bg-azure hover:bg-blue-600"
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
          className="flex-1 sm:flex-none px-8 text-white hover:text-white bg-crimson-red hover:bg-lipstick-red"
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
    </article>
  );
}
