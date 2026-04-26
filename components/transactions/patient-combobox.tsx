"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchPatients, usePatients } from "@/hooks/usePatients";
import { getAgeGroupLabel } from "@/constants";
import type { PatientOption } from "@/lib/types";
import type { MEDICINE_AGE_GROUP } from "@/generated/prisma/client";

interface PatientComboboxProps {
  value: string;
  onChange: (patientId: string, patient: PatientOption | null) => void;
  disabled?: boolean;
  error?: boolean;
  ageGroup?: MEDICINE_AGE_GROUP;
}

export function PatientCombobox({
  value,
  onChange,
  disabled,
  error,
  ageGroup,
}: PatientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Pass ageGroup to filter patients
  const { data: initialPatients = [], isLoading: isLoadingInitial } =
    usePatients(ageGroup);
  const { data: searchResults = [], isLoading: isSearching } =
    useSearchPatients(search, ageGroup);

  const patients = search.length >= 2 ? searchResults : initialPatients;
  const isLoading = isLoadingInitial || isSearching;

  const selectedPatient = patients.find((p) => p.id === value);

  const formatPatient = (patient: PatientOption) => {
    return `${patient.name} (${getAgeGroupLabel(patient.ageGroup)}) - ${patient.phone}`;
  };

  const handleSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId) || null;
    onChange(patientId, patient);
    setOpen(false);
    setSearch("");
  };

  // Helper text for filtering
  const getFilterText = () => {
    if (!ageGroup || ageGroup === "all_ages") {
      return "Showing all patients";
    }
    return `Showing ${getAgeGroupLabel(ageGroup)} patients only`;
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
            "w-full justify-between h-11 font-normal",
            !value && "text-muted-foreground",
            error && "border-red-400 focus:ring-red-400",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <User className="size-4 shrink-0" />
            {selectedPatient
              ? formatPatient(selectedPatient)
              : "Search patient..."}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-(--radix-popover-trigger-width)"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or phone..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : patients.length === 0 ? (
              <CommandEmpty>
                {search.length >= 2
                  ? "No patients found."
                  : "Type to search patients..."}
              </CommandEmpty>
            ) : (
              <CommandGroup heading={getFilterText()}>
                {patients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={patient.id}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === patient.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{formatPatient(patient)}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
