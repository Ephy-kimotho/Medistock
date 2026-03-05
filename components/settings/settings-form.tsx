"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { type Settings, settingsSchema } from "@/lib/schemas/settings";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { SettingsFormSkeleton } from "@/components/settings/settings-skeleton";
import { Loader, Info } from "lucide-react";

function SettingsForm() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Settings>({
    mode: "all",
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      facilityName: "",
      facilityAddress: "",
      expiryWarnDays: 7,
      criticalExpiryWarnDays: 2,
    },
  });

  // Update form when settings data loads
  useEffect(() => {
    if (settings) {
      reset({
        facilityName: settings.facilityName || "",
        facilityAddress: settings.facilityAddress || "",
        expiryWarnDays: settings.expiryWarnDays ?? 7,
        criticalExpiryWarnDays: settings.criticalExpiryWarnDays ?? 2,
      });
    }
  }, [settings, reset]);

  const onSubmit: SubmitHandler<Settings> = (values) => {
    updateSettings(values);
  };

  if (isLoading) {
    return <SettingsFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Facility Information Card */}
      <Card className="bg-white rounded-lg border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Facility Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Facility Name */}
          <div className="space-y-2">
            <Label htmlFor="facilityName" className="font-medium">
              Name
            </Label>
            <Input
              type="text"
              id="facilityName"
              placeholder="e.g Central Health Center."
              disabled={isPending}
              className={cn(
                "h-11 text-base",
                errors.facilityName
                  ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                  : "focus-visible:ring-azure focus-visible:border-azure",
              )}
              {...register("facilityName")}
            />
            {errors.facilityName && (
              <p className="text-red-500 text-sm">
                {errors.facilityName.message}
              </p>
            )}
          </div>

          {/* Facility Address */}
          <div className="space-y-2">
            <Label htmlFor="facilityAddress" className="font-medium">
              Address
            </Label>
            <Input
              type="text"
              id="facilityAddress"
              placeholder="e.g Britam 4th Floor"
              disabled={isPending}
              className={cn(
                "h-11 text-base",
                errors.facilityAddress
                  ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                  : "focus-visible:ring-azure focus-visible:border-azure",
              )}
              {...register("facilityAddress")}
            />
            {errors.facilityAddress && (
              <p className="text-red-500 text-sm">
                {errors.facilityAddress.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiry Alert Configuration Card */}
      <Card className="bg-white rounded-lg border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Expiry Alert Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Warning Threshold */}
          <div className="space-y-2">
            <Label htmlFor="expiryWarnDays" className="font-medium">
              Warning Threshold
            </Label>
            <Input
              type="number"
              id="expiryWarnDays"
              placeholder="Enter the warning threshold"
              disabled={isPending}
              min={1}
              className={cn(
                "h-11 text-base",
                errors.expiryWarnDays
                  ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                  : "focus-visible:ring-azure focus-visible:border-azure",
              )}
              {...register("expiryWarnDays", { valueAsNumber: true })}
            />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Days before expiry to warn defaults to 7 days.
              </p>
              <p className="text-xs text-muted-foreground">
                Alert when medicine expires within this many days.
              </p>
            </div>
            {errors.expiryWarnDays && (
              <p className="text-red-500 text-sm">
                {errors.expiryWarnDays.message}
              </p>
            )}
          </div>

          {/* Critical Threshold */}
          <div className="space-y-2">
            <Label htmlFor="criticalExpiryWarnDays" className="font-medium">
              Critical Threshold
            </Label>
            <Input
              type="number"
              id="criticalExpiryWarnDays"
              placeholder="Enter the critical threshold"
              disabled={isPending}
              min={1}
              className={cn(
                "h-11 text-base",
                errors.criticalExpiryWarnDays
                  ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                  : "focus-visible:ring-azure focus-visible:border-azure",
              )}
              {...register("criticalExpiryWarnDays", { valueAsNumber: true })}
            />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Days before expiry for critical alert, defaults to 2 days.
              </p>
              <p className="text-xs text-muted-foreground">
                Urgent alert when expiry is imminent.
              </p>
            </div>
            {errors.criticalExpiryWarnDays && (
              <p className="text-red-500 text-sm">
                {errors.criticalExpiryWarnDays.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-azure/10 border border-azure/30 rounded-lg">
        <Info className="size-5 text-azure shrink-0 mt-0.5" />
        <p className="text-sm text-azure">
          Alerts are sent to Administrator and Inventory Manager users only who
          have enabled app notifications.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isPending || !isDirty}
          className="w-full sm:w-1/2 h-12 bg-azure hover:bg-blue-600 font-semibold text-base"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader className="size-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </form>
  );
}

export { SettingsForm };
