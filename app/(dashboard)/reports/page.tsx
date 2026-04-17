import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { ReportsContent } from "@/components/reports/reports-content";
import { FileText } from "lucide-react";
import type { Role } from "@/lib/types";

export default async function ReportsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user.role;

  // Check if user has access to any reports
  const canAccessHR = ["hr"].includes(userRole as Role);
  const canAccessInventory = ["admin", "inventory_manager", "auditor"].includes(
    userRole as Role,
  );

  if (!canAccessHR && !canAccessInventory) {
    redirect("/dashboard");
  }

  return (
    <section className="flex-1 flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-azure/10 flex items-center justify-center">
            <FileText className="size-5 text-azure" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-sm text-muted-foreground">
              Generate and download reports in PDF format
            </p>
          </div>
        </div>
      </header>

      <ReportsContent
        canAccessHR={canAccessHR}
        canAccessInventory={canAccessInventory}
      />
    </section>
  );
}
