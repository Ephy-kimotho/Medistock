import { getServerSession } from "@/lib/check-permissions";
import { UsersTab } from "@/components/users/users-tab";
import { UnauthorizedUI } from "@/components/users/unauthorized-ui";
import { redirect } from "next/navigation";
import { Statcards } from "@/components/stat-cards";
import { getUsersStats } from "@/lib/actions/users";
import { Users as UsersIcon, ShieldUser, Shield } from "lucide-react";
import type { StatCardProps, Role } from "@/lib/types";

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
  }>;
}

async function Users({ searchParams }: UsersPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user.role as Role;

  if (!["hr", "admin"].includes(userRole)) {
    return <UnauthorizedUI />;
  }

  // HR has read-only access
  const isReadOnly = userRole === "hr";

  const params = await searchParams;

  const page = Number(params.page) || 1;
  const search = params.search || "";
  const searchRole = params.role || "all";

  const userStats = await getUsersStats();

  const statsInfo: StatCardProps[] = [
    {
      title: "Total users",
      metric: userStats.totalUsers || 0,
      details: "Total User's count",
      Icon: UsersIcon,
      theme: "green",
    },
    {
      title: "Administrators",
      metric: userStats.admins || 0,
      details: "Admin count",
      Icon: ShieldUser,
      theme: "red",
    },
    {
      title: "Inventory Managers",
      metric: userStats.inventoryManagers || 0,
      details: "Inventory Manager's count",
      Icon: Shield,
      theme: "orange",
    },
    {
      title: "Pharmacists",
      metric: userStats.normalUsers || 0,
      details: "Pharmacists' count",
      Icon: UsersIcon,
      theme: "blue",
    },
  ];

  return (
    <section className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 md:justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 font-bold">User Management</h2>
          <p className="text-muted-foreground text-pretty">
            {isReadOnly
              ? "View user accounts and roles."
              : "Manage user accounts, roles, and permissions."}
          </p>
        </div>
      </header>

      {/* Users Statistics Cards */}
      <Statcards stats={statsInfo} />

      {/* Users List */}
      <UsersTab
        initialFilters={{ search, searchRole }}
        currentPage={page}
        isReadOnly={isReadOnly}
      />
    </section>
  );
}

export default Users;
