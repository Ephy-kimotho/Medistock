import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/check-permissions";
import { AlertsContent } from "@/components/alerts/alerts-content";
import { UnauthorizedUI } from "./unauthorized-ui";
import type { Role } from "@/lib/types";

export default async function AlertsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user.role as Role;

  if (!["admin", "inventory_manager"].includes(userRole)) {
    return <UnauthorizedUI />;
  }

  return (
    <div className="flex-1 p-4 overflow-auto">
      <AlertsContent userId={session.user.id} />
    </div>
  );
}
