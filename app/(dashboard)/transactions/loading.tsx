"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { usePermissions } from "@/hooks/usePermissions";

export default function TransactionsLoading() {
  const { isAdmin, isInventoryManager } = usePermissions();

  const isAdminOrManager = isAdmin || isInventoryManager;

  return (
    <section className="flex-1 flex flex-col gap-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-44" />
        </div>
        {isAdminOrManager && <Skeleton className="h-11 w-40 rounded-md" />}
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="size-10 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-12" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Search and Date Row */}
        <div className="flex flex-col lg:flex-row gap-3">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-44 rounded-md" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-10 w-44 rounded-md" />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 w-48 rounded-md" />
          <Skeleton className="h-10 w-48 rounded-md" />
          {isAdmin && <Skeleton className="h-10 w-48 rounded-md" />}
          <div className="flex items-center gap-2 sm:ml-auto">
            <Skeleton className="h-11 w-32 rounded-md" />
            <Skeleton className="h-11 w-32 rounded-md" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Time</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Medicine</TableHead>
              <TableHead className="font-semibold text-center">
                Quantity
              </TableHead>
              <TableHead className="font-semibold">Processed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-28" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-5 w-10 mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 flex items-center justify-between border-t border-border mt-auto">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </footer>
    </section>
  );
}
