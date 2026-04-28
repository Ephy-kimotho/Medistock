"use client";

import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Controller,
  useWatch,
  Control,
  FieldValues,
  Path,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns";

interface DateRangePickerProps<T extends FieldValues> {
  control: Control<T>;
  nameFrom: Path<T>;
  nameTo: Path<T>;
  labelFrom?: string;
  labelTo?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker<T extends FieldValues>({
  control,
  nameFrom,
  nameTo,
  labelFrom = "From Date",
  labelTo = "To Date",
  disabled = false,
  className,
}: DateRangePickerProps<T>) {
  const dateFrom = useWatch({ control, name: nameFrom }) as Date | undefined;
  const dateTo = useWatch({ control, name: nameTo }) as Date | undefined;

  const today = startOfDay(new Date());

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {/* Date From */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{labelFrom}</Label>
        <Controller
          control={control}
          name={nameFrom}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {field.value
                    ? format(field.value as Date, "dd/MM/yyyy")
                    : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value as Date | undefined}
                  onSelect={field.onChange}
                  disabled={(date) => {
                    const normalizedDate = startOfDay(date);
                    if (normalizedDate > today) return true;
                    if (dateTo && normalizedDate >= startOfDay(dateTo))
                      return true;
                    return false;
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      {/* Date To */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{labelTo}</Label>
        <Controller
          control={control}
          name={nameTo}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {field.value
                    ? format(field.value as Date, "dd/MM/yyyy")
                    : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value as Date | undefined}
                  onSelect={field.onChange}
                  disabled={(date) => {
                    const normalizedDate = startOfDay(date);
                    if (normalizedDate > today) return true;
                    if (dateFrom && normalizedDate <= startOfDay(dateFrom))
                      return true;
                    return false;
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>
    </div>
  );
}
