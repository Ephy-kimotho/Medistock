import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface MedicineFormSkeletonProps {
  trigger?: React.ReactNode;
}

export function MedicineFormSkeleton({ trigger }: MedicineFormSkeletonProps) {
  return (
    <Dialog open={false}>
      {/* Render a disabled version of the trigger */}
      {trigger && (
        <div className="pointer-events-none opacity-50">{trigger}</div>
      )}
    </Dialog>
  );
}

export function MedicineFormContentSkeleton() {
  return (
    <div className="space-y-6 py-2">
      {/* Basic Information Section */}
      <section className="space-y-4">
        <Skeleton className="h-4 w-32" />

        {/* Medicine Name */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </section>

      {/* Classification Section */}
      <section className="space-y-4">
        <Skeleton className="h-4 w-24" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="space-y-4">
        <Skeleton className="h-4 w-16" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Manufacturer */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Reorder Level */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-11 w-32 rounded-md" />
        <Skeleton className="h-11 w-44 rounded-md" />
      </div>
    </div>
  );
}


export function MedicineDialogSkeleton() {
  return (
    <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <Skeleton className="h-7 w-48" />
      </DialogHeader>

      <MedicineFormContentSkeleton />
    </DialogContent>
  );
}
