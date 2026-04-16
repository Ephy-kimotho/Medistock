// components/categories/category-page-content.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pill, CalendarClock, AlertTriangle, ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MedicineForm } from "@/components/medicines/medicine-form";
import { CategoryMedicinesListing } from "./category-medicines-listing";
import { Statcards } from "@/components/stat-cards";
import { useMedicineCategories } from "@/hooks/useMedicines";
import type { CategoryMedicine, StatCardProps } from "@/lib/types";

interface CategoryStats {
  totalMedicines: number;
  expiringSoonCount: number;
  expiredCount: number;
  expiryWarnDays: number;
}

interface CategoryPageContentProps {
  categoryId: string;
  categoryName: string;
  categoryDescription?: string | null;
  medicines: CategoryMedicine[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  searchTerm: string;
  stats: CategoryStats;
  userId: string;
  canManageStock: boolean;
}

export function CategoryPageContent({
  categoryId,
  categoryName,
  categoryDescription,
  medicines,
  totalPages,
  currentPage,
  totalCount,
  hasNext,
  hasPrev,
  searchTerm,
  stats,
  userId,
  canManageStock,
}: CategoryPageContentProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const { data: categories } = useMedicineCategories();

  // Construct stat cards in client component (Icons are not serializable)
  const statsInfo: StatCardProps[] = [
    {
      title: "Total Medicines",
      metric: stats.totalMedicines,
      details: "In this category",
      Icon: Pill,
      theme: "green",
    },
    {
      title: "Expiring Soon",
      metric: stats.expiringSoonCount,
      details: `Within ${stats.expiryWarnDays} days`,
      Icon: CalendarClock,
      theme: "orange",
    },
    {
      title: "Expired",
      metric: stats.expiredCount,
      details: "Requires attention",
      Icon: AlertTriangle,
      theme: "red",
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 mt-1"
                  onClick={() => router.push("/inventory/categories")}
                >
                  <ArrowLeft className="size-5" />
                  <span className="sr-only">Back to categories</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to categories</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add Medicines for {categoryName} Category
            </h1>
            {categoryDescription && (
              <p className="text-sm text-muted-foreground mt-1">
                {categoryDescription}
              </p>
            )}
          </div>
        </div>

        {canManageStock && (
          <MedicineForm
            isEditing={false}
            categoryInfo={categories ?? []}
            open={formOpen}
            setOpen={setFormOpen}
            lockedCategoryId={categoryId}
            lockedCategoryName={categoryName}
          >
            <Button className="bg-azure hover:bg-blue-600 gap-2 shrink-0">
              <Plus className="size-4" />
              Add Medicine
            </Button>
          </MedicineForm>
        )}
      </header>

      {/* Stat Cards */}
      <Statcards stats={statsInfo} />

      {/* Medicines Listing */}
      <CategoryMedicinesListing
        categoryId={categoryId}
        medicines={medicines}
        totalPages={totalPages}
        currentPage={currentPage}
        totalCount={totalCount}
        hasNext={hasNext}
        hasPrev={hasPrev}
        searchTerm={searchTerm}
        userId={userId}
        canManageStock={canManageStock}
      />
    </>
  );
}