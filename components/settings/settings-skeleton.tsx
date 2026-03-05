"use client";

import { Card, CardHeader, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

function SettingsFormSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="bg-white rounded-lg border border-border">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-lg border border-border">
        <CardHeader>
          <Skeleton className="h-6 w-52" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-3 w-48" />
          </div>
        </CardContent>
      </Card>

      <Skeleton className="h-16 w-full rounded-lg" />

      <div className="flex justify-center pt-2">
        <Skeleton className="h-12 w-1/2 rounded-md" />
      </div>
    </div>
  );
}

export { SettingsFormSkeleton };
