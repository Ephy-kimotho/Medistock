import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getMedicineNames } from "@/lib/actions/stock-inventory";
import { AddStockForm } from "@/components/inventory/add-stock";
import { getTransactionStats } from "@/lib/actions/transactions";
import { Statcards } from "@/components/stat-cards";
import { Move, TrendingUp, TrendingDown, CircleAlert } from "lucide-react";
import type { StatCardProps } from "@/lib/types";

async function TransactionsHistoryPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const isAdminOrManager =
    user.role === "admin" || user.role === "inventory_manager";

  // prefetch medicine info on the server
  const queryClient = new QueryClient();
  const statsPromise = getTransactionStats();

  const [stats] = await Promise.all([
    statsPromise,
    queryClient.prefetchQuery({
      queryKey: ["medicine-info"],
      queryFn: () => getMedicineNames(),
    }),
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
      <div className="flex-1 flex flex-col gap-4">
        <header className="flex flex-col items-start md:flex-row md:items-center gap-4 md:gap-0 md:justify-between">
          <div>
            <h2 className="text-2xl text-slate-900 font-bold">
              Transactions History
            </h2>
            <p className="text-muted-foreground text-pretty">
              View and track medicine movements.
            </p>
          </div>

          {isAdminOrManager && <AddStockForm userId={user.id} />}
        </header>

        {/* Stat cards goes here */}
        <Statcards stats={statsInfo} />

        {/* Transaction listings goes here */}
      </div>
    </HydrationBoundary>
  );
}

export default TransactionsHistoryPage;
