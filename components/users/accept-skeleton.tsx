import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AcceptFormSkeleton() {
  return (
    <Card className="w-11/12 border-0 md:w-5/12 shadow-lg rounded-lg pb-10">
      <CardHeader className="text-center space-y-2">
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-7">
        {/* Name field skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Password field skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Confirm Password field skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Button skeleton */}
        <div className="text-center pt-3">
          <Skeleton className="h-12 w-2/3 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
