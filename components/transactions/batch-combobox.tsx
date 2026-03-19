"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { BatchInfo } from "@/lib/types";

interface BatchComboboxProps {
  batches: BatchInfo[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function BatchCombobox({
  batches,
  value,
  onChange,
  disabled,
  error,
}: BatchComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedBatch = batches.find((b) => b.id === value);

  const formatBatchLabel = (batch: BatchInfo) => {
    return `${batch.batchNumber} • ${batch.quantity} units • Expires: ${format(
      new Date(batch.expiryDate),
      "MMMM d, yyyy",
    )}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full h-11 justify-between font-normal",
            !value && "text-muted-foreground",
            error && "border-red-400 focus:ring-red-400",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {selectedBatch ? formatBatchLabel(selectedBatch) : "Choose batch"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-(--radix-popover-trigger-width)"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search batch..." className="h-10" />
          <CommandSeparator className="mt-1" />
          <CommandList className="max-h-60">
            <CommandEmpty>No batches available.</CommandEmpty>
            <CommandGroup>
              {batches.map((batch) => (
                <CommandItem
                  key={batch.id}
                  value={batch.batchNumber}
                  onSelect={() => {
                    onChange(batch.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === batch.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium font-mono">
                      {batch.batchNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {batch.quantity} units • Expires:{" "}
                      {format(new Date(batch.expiryDate), "MMM d, yyyy")}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
