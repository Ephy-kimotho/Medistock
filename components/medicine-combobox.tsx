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
import { getAgeGroupLabel } from "@/constants";
import type { MedicineName } from "@/lib/types";

interface MedicineComboboxProps {
  medicines: MedicineName[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

export function MedicineCombobox({
  medicines,
  value,
  onChange,
  disabled,
  error,
  placeholder = "Select a medicine...",
}: MedicineComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedMedicine = medicines.find((m) => m.id === value);

  const formatMedicineDisplay = (medicine: MedicineName) => {
    return `${medicine.name} - ${getAgeGroupLabel(medicine.ageGroup)}`;
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
            "w-full h-11 justify-between capitalize font-normal",
            !value && "text-muted-foreground",
            error && "border-red-400 focus:ring-red-400",
          )}
        >
          {selectedMedicine
            ? formatMedicineDisplay(selectedMedicine)
            : placeholder}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-(--radix-popover-trigger-width)"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search medicines..."
            className="h-10 border-0 focus:ring-0"
          />
          <CommandSeparator className="mt-1" />
          <CommandList className="max-h-60">
            <CommandEmpty>No medicine found.</CommandEmpty>
            <CommandGroup>
              {medicines.map((medicine) => (
                <CommandItem
                  key={medicine.id}
                  value={medicine.name}
                  onSelect={() => {
                    onChange(medicine.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === medicine.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span>{medicine.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    - {getAgeGroupLabel(medicine.ageGroup)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
