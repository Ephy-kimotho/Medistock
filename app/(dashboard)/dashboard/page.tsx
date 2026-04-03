import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { getMedicineStats } from "@/lib/actions/medicines";
import {
  getRecentTransactionsAdmin,
  getRecentTransactionsStaff,
} from "@/lib/actions/dashboard";
import { Greeting } from "@/components/dashboard/greeting";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentTransactionsAdmin } from "@/components/dashboard/recent-transactions-admin";
import { RecentTransactionsStaff } from "@/components/dashboard/recent-transactions-staff";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import { Statcards } from "@/components/stat-cards";
import { Pill, TrendingDown, CalendarClock, AlertCircle } from "lucide-react";
import type {
  StatCardProps,
  Role,
  RecentTransactionAdmin,
  RecentTransactionStaff,
} from "@/lib/types";

async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const userRole = user.role as Role;

  // Auditors cannot access the dashboard
  if (userRole === "auditor") {
    redirect("/inventory");
  }

  const isStaff = userRole === "user";

  // Fetch data based on role
  const [stats, transactions] = await Promise.all([
    getMedicineStats(),
    isStaff ? getRecentTransactionsStaff() : getRecentTransactionsAdmin(),
  ]);

  const statsInfo: StatCardProps[] = [
    {
      title: "Total Medicines",
      metric: stats.totalMedicines,
      details: "Medicine count",
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
    <section className="flex-1 flex flex-col">
      {/* Greeting */}
      <Greeting name={user.name} />

      {/* Stat Cards */}
      <Statcards stats={statsInfo} />

      {/* Quick Actions */}
      <QuickActions role={userRole} />

      {/* Recent Activity Section */}
      {isStaff ? (
        <RecentTransactionsStaff
          transactions={transactions as RecentTransactionStaff[]}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentAlerts />
          <RecentTransactionsAdmin
            transactions={transactions as RecentTransactionAdmin[]}
          />
        </div>
      )}
    </section>
  );
}

export default DashboardPage;
