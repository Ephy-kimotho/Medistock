import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryDetailLoading() {
  return (
    <section className="flex-1 flex flex-col gap-6">
      {/* Header Skeleton */}
      <header>
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-4 w-64 mt-2" />
      </header>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="size-10 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Listing Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-36" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted p-4">
            <div className="flex gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-24" />
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 border-t border-border">
              <div className="flex gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
