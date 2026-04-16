// app/(dashboard)/transactions/[id]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionDetailsLoading() {
  return (
    <section className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Skeleton className="size-10 rounded-lg" />
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </section>
  );
}
