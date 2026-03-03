import { getServerSession } from "@/lib/check-permissions";
import { InvitationForm } from "@/components/users/invite-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { InvitationsTab } from "@/components/users/invitations-tab";
import { UsersTab } from "@/components/users/users-tab";
import { UserPlus } from "lucide-react";
import { redirect } from "next/navigation";
import { Statcards } from "@/components/stat-cards";
import { getUsersStats } from "@/lib/actions/users";
import { Users as UsersIcon, ShieldUser, Shield } from "lucide-react";
import type { Role, StatCardProps } from "@/lib/types";

async function Users() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const role = (session?.user.role as Role) || "user";

  if (role !== "admin") {
    redirect("/dashboard");
  }

  const userStats = await getUsersStats();

  const statsInfo: StatCardProps[] = [
    {
      title: "Total users",
      metric: userStats.totalUsers || 0,
      details: "All User's count",
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
      title: "Regular Staff",
      metric: userStats.normalUsers || 0,
      details: "Regular Staff count",
      Icon: UsersIcon,
      theme: "blue",
    },
  ];

  return (
    <section className="space-y-4 min-h-screen">
      <header className="flex flex-col md:flex-row  md:items-center gap-4 md:gap-0 md:justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 font-bold">User Management</h2>
          <p className="text-muted-foreground text-pretty">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

        <InvitationForm>
          <Button className="h-0 py-5 px-8 bg-azure self-start hover:bg-primary inline-flex items-center gap-2">
            <UserPlus className="size-4" />
            Invite user
          </Button>
        </InvitationForm>
      </header>

      {/* Users Statistics Cards */}
      <Statcards stats={statsInfo} />

      {/* Tabs content */}
      <Tabs defaultValue="users">
        <TabsList className="w-7/12">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="Invitations">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="Invitations">
          <InvitationsTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}

export default Users;
