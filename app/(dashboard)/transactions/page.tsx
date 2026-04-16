import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getMedicineNames } from "@/lib/actions/stock-inventory";
import {
  getTransactions,
  getTransactionStats,
  getTransactionUsers,
} from "@/lib/actions/transactions";
import { AddStockForm } from "@/components/inventory/add-stock";
import { TransactionListing } from "@/components/transactions/transaction-listing";
import { Statcards } from "@/components/stat-cards";
import { Move, TrendingUp, TrendingDown, CircleAlert } from "lucide-react";
import type { StatCardProps } from "@/lib/types";

interface TransactionsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    medicine?: string;
    user?: string;
    from?: string;
    to?: string;
  }>;
}

async function TransactionsHistoryPage({
  searchParams,
}: TransactionsPageProps) {
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
  const type = params.type || "all";
  const medicineId = params.medicine || "all";
  const userId = params.user || "all";
  const fromDate = params.from || "";
  const toDate = params.to || "";

  const queryClient = new QueryClient();

  // Parallel fetching
  const [stats] = await Promise.all([
    getTransactionStats(isAdminOrManager ? userId : undefined),
    // Prefetch medicine info for AddStockForm
    queryClient.prefetchQuery({
      queryKey: ["medicine-info"],
      queryFn: () => getMedicineNames(),
    }),
    // Prefetch transactions list
    queryClient.prefetchQuery({
      queryKey: [
        "transactions",
        "list",
        {
          page: currentPage,
          search,
          type,
          medicineId,
          userId,
          fromDate,
          toDate,
        },
      ],
      queryFn: () =>
        getTransactions({
          page: currentPage,
          search,
          type,
          medicineId,
          userId,
          fromDate,
          toDate,
        }),
    }),
    // Prefetch users for filter dropdown (admin only)
    isAdminOrManager
      ? queryClient.prefetchQuery({
          queryKey: ["transactions", "users"],
          queryFn: () => getTransactionUsers(),
        })
      : Promise.resolve(),
  ]);

  const statsInfo: StatCardProps[] = [
    {
      title: "Total Transactions",
      metric: stats.totalTransactions,
      details: "All movements",
      Icon: Move,
      theme: "blue",
    },
    {
      title: "Stock In Transactions",
      metric: stats.stockInTransactions,
      details: "Inventory added",
      Icon: TrendingUp,
      theme: "green",
    },
    {
      title: "Dispense Transactions",
      metric: stats.dispensedTransactions,
      details: "Given to patients",
      Icon: TrendingDown,
      theme: "orange",
    },
    {
      title: "Wastage Transactions",
      metric: stats.wastageTransactions,
      details: "Medicine disposed",
      Icon: CircleAlert,
      theme: "red",
    },
  ];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex-1 flex flex-col gap-2">
        <header className="flex flex-col items-start md:flex-row md:items-center gap-4 md:gap-0 md:justify-between">
          <div>
            <h2 className="text-2xl text-slate-900 font-bold">
              Transactions History
            </h2>
            <p className="text-sm text-muted-foreground">
              Click on a row to view more details
            </p>
          </div>

          {isAdminOrManager && <AddStockForm userId={user.id} />}
        </header>

        {/* Stat cards */}
        <Statcards stats={statsInfo} />

        {/* Transaction listings */}
        <TransactionListing
          initialSearch={search}
          initialType={type}
          initialMedicineId={medicineId}
          initialUserId={userId}
          initialFromDate={fromDate}
          initialToDate={toDate}
          currentPage={currentPage}
          isAdmin={isAdminOrManager}
        />
      </div>
    </HydrationBoundary>
  );
}

export default TransactionsHistoryPage;
