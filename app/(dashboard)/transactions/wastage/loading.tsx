import { Skeleton } from "@/components/ui/skeleton";

export default function WastageLoading() {
  return (
    <section className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <header>
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-80 mt-2" />
      </header>

      {/* Form Skeleton */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Medicine Select */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Batch Select */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-11 flex-1 rounded-md" />
            <Skeleton className="h-11 flex-1 rounded-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
