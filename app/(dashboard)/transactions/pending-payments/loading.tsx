import { Skeleton } from "@/components/ui/skeleton";

export default function PendingPaymentsLoading() {
  return (
    <section className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
      </header>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Table */}
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
            <div className="flex gap-4 items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-24" />
              ))}
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
