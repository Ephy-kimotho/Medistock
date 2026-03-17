import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/check-permissions";
import { getMedicines, getCategoryNames } from "@/lib/actions/medicines";
import { MedicineListing } from "@/components/medicines/medicine-listing";
import { AddMedicineForm } from "@/components/medicines/add-medicine";
import { Button } from "@/components/ui/button";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { getMedicineStats } from "@/lib/actions/medicines";
import { Statcards } from "@/components/stat-cards";
import { Pill, TrendingDown, CalendarClock, AlertCircle } from "lucide-react";
import type { StockStatus, StatCardProps } from "@/lib/types";

interface MedicinesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    status?: string;
  }>;
}

async function MedicinesPage({ searchParams }: MedicinesPageProps) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const isAdminOrManager =
    user.role === "admin" || user.role === "inventory_manager";

  const params = await searchParams;

  const stats = await getMedicineStats();

  const currentPage = Number(params.page) || 1;
  const search = params.search || "";
  const categoryId = params.category || "all";
  const status = (params.status as StockStatus) || "all";

  const queryClient = new QueryClient();

  // Prefetch medicines
  await queryClient.prefetchQuery({
    queryKey: ["medicines", "list", currentPage, search, categoryId, status],
    queryFn: () =>
      getMedicines({ page: currentPage, search, categoryId, status }),
  });

  // Prefetch categories for filter dropdown
  await queryClient.prefetchQuery({
    queryKey: ["category-info"],
    queryFn: () => getCategoryNames(),
  });

  const statsInfo: StatCardProps[] = [
    {
      title: "Total Medicines",
      metric: stats.totalMedicines,
      details: "Medicine's count",
      Icon: Pill,
      theme: "green",
    },
    {
      title: "Low Stock",
      metric: stats.lowStockCount,
      details: "Requires attention",
      Icon: TrendingDown,
      theme: "orange",
    },
    {
      title: "Expiring Soon",
      metric: stats.expiringSoonCount,
      details: `Within ${stats.expiryWarnDays} days`,
      Icon: CalendarClock,
      theme: "blue",
    },
    {
      title: "Expired",
      metric: stats.expiredCount,
      details: "Critical",
      Icon: AlertCircle,
      theme: "red",
    },
  ];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex-1 flex flex-col gap-4">
        <header className="flex flex-col items-start md:flex-row md:items-center gap-4 md:gap-0 md:justify-between">
          <div>
            <h2 className="text-2xl text-slate-900 font-bold">Medicines</h2>
            <p className="text-muted-foreground text-pretty">
              Manage medicine inventory
            </p>
          </div>

          {isAdminOrManager && (
            <AddMedicineForm>
              <Button
                size="lg"
                className="gap-2 px-6 font-semibold bg-azure hover:bg-blue-600"
              >
                <Plus className="size-5" />
                Add Medicine
              </Button>
            </AddMedicineForm>
          )}
        </header>

        <Statcards stats={statsInfo} />

        <MedicineListing
          initialSearch={search}
          initialCategoryId={categoryId}
          initialStatus={status}
          currentPage={currentPage}
        />
      </div>
    </HydrationBoundary>
  );
}

export default MedicinesPage;
