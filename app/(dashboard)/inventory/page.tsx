import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import {
  getMedicineNames,
  getInventoryStats,
  getStockInventory,
} from "@/lib/actions/stock-inventory";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { AddStockForm } from "@/components/inventory/add-stock";
import { Statcards } from "@/components/stat-cards";
import { Pill, TrendingDown, CalendarClock, AlertCircle } from "lucide-react";
import { StockListing } from "@/components/inventory/stock-listing";
import type { StatCardProps } from "@/lib/types";

interface StockPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    medicine?: string;
    status?: string;
  }>;
}

async function StockInventoryPage({ searchParams }: StockPageProps) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const isAdminOrManager =
    user.role === "admin" || user.role === "inventory_manager";

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const search = params.search || "";
  const medicineId = params.medicine || "all";
  const status = params.status || "all";

  // prefetch medicine info on the server
  const queryClient = new QueryClient();
  const statsPromise = getInventoryStats();

  // Parallel fetching of medicine info, cards info and the first page's data
  const [statsResponse] = await Promise.all([
    statsPromise,
    queryClient.prefetchQuery({
      queryKey: ["medicine-info"],
      queryFn: () => getMedicineNames(),
    }),
    queryClient.prefetchQuery({
      queryKey: [
        "stock-inventory",
        "list",
        { page: currentPage, search, medicineId, status },
      ],
      queryFn: () =>
        getStockInventory({ page: currentPage, search, medicineId, status }),
    }),
  ]);

  const statsInfo: StatCardProps[] = [
    {
      title: "Total Batches",
      metric: statsResponse.totalBatches,
      details: "Batch stock count",
      Icon: Pill,
      theme: "green",
    },
    {
      title: "Low Stock",
      metric: statsResponse.lowStockCount,
      details: "Requires attention",
      Icon: TrendingDown,
      theme: "orange",
    },
    {
      title: "Expiring Soon",
      metric: statsResponse.expiringSoonCount,
      details: `Within ${statsResponse.expiryWarnDays} days`,
      Icon: CalendarClock,
      theme: "blue",
    },
    {
      title: "Expired",
      metric: statsResponse.expiredCount,
      details: "Critical",
      Icon: AlertCircle,
      theme: "red",
    },
  ];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex flex-col items-start md:flex-row md:items-center gap-4 md:gap-0 md:justify-between">
          <div>
            <h2 className="text-2xl text-slate-900 font-bold">
              Stock Inventory
            </h2>
            <p className="text-muted-foreground text-pretty">
              Manage all medicine batches and stock levels.
            </p>
          </div>

          {/* Add stock form goes here */}
          {isAdminOrManager && <AddStockForm userId={user.id} />}
        </header>

        {/* Stock stat cards goes here */}
        <Statcards stats={statsInfo} />

        {/* Stock inventory listings goes here */}
        <StockListing
          initialSearch={search}
          initialMedicineId={medicineId}
          initialStatus={status}
          currentPage={currentPage}
        />
      </div>
    </HydrationBoundary>
  );
}

export default StockInventoryPage;
