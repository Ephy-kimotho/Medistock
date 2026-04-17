"use client";

import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpiredBatch } from "@/lib/types";

interface ExpiredBatchBannerProps {
  expiredBatches: ExpiredBatch[];
  onRecordExpiry: (batch: ExpiredBatch) => void;
  isLocked: boolean;
}

export function ExpiredBatchBanner({
  expiredBatches,
  onRecordExpiry,
  isLocked,
}: ExpiredBatchBannerProps) {
  if (expiredBatches.length === 0) return null;

  return (
    <div className="rounded-lg border border-princeton-orange/50 bg-princeton-orange/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-princeton-orange shrink-0 mt-0.5" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-semibold text-slate-900">
              {expiredBatches.length} batch
              {expiredBatches.length !== 1 && "es"} expired and need
              {expiredBatches.length === 1 && "s"} to be recorded
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Record these as wastage to keep your inventory accurate
            </p>
          </div>

          <ul className="space-y-2">
            {expiredBatches.map((batch) => (
              <li
                key={batch.id}
                className="flex items-center justify-between gap-4 p-3 bg-white rounded-md border border-border"
              >
                <div>
                  <p className="font-medium capitalize">
                    {batch.medicine.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{batch.batchNumber}</span>
                    {" · "}
                    {batch.quantity} {batch.medicine.unit}
                    {" · "}
                    Expired {format(new Date(batch.expiryDate), "MMM d, yyyy")}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-princeton-orange hover:bg-princeton-orange/90 shrink-0"
                  onClick={() => onRecordExpiry(batch)}
                  disabled={isLocked}
                >
                  Record Expiry
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
