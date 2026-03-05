"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mail, Loader } from "lucide-react";
import { useConfigureEmailsAlerts } from "@/hooks/useUsers";

interface AlertConfigProps {
  userId: string;
  initialValue: boolean;
}

export function AlertConfig({ userId, initialValue }: AlertConfigProps) {
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(initialValue);

  const { mutate: configureEmailAlerts, isPending } =
    useConfigureEmailsAlerts();

  const handleToggle = (checked: boolean) => {
    // Optimistically update UI
    setEmailAlertsEnabled(checked);

    configureEmailAlerts(
      { allow: checked, userId },
      {
        onError: () => {
          // Revert on error
          setEmailAlertsEnabled(!checked);
        },
      },
    );
  };

  return (
    <Card className="bg-white rounded-lg border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <div className="space-y-0.5">
              <Label
                htmlFor="email-alerts"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Email Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive email notifications for low stock and expiring medicines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPending && (
              <Loader className="size-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="email-alerts"
              checked={emailAlertsEnabled}
              onCheckedChange={handleToggle}
              disabled={isPending}
              className="data-[state=checked]:bg-azure cursor-pointer"
            />
          </div>
        </div>

        {/* Show current status */}
        <p className="text-xs text-muted-foreground border-t pt-3">
          Email alerts are currently{" "}
          <span
            className={
              emailAlertsEnabled
                ? "text-green-600 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {emailAlertsEnabled ? "enabled" : "disabled"}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
