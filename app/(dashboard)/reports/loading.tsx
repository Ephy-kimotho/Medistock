import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <section className="flex-1 flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
      </header>

      {/* Sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((card) => (
              <Skeleton key={card} className="h-36 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
