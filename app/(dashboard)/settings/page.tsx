import { SettingsForm } from "@/components/settings/settings-form";
import { getServerSession } from "@/lib/check-permissions";
import { UnauthorizedUI } from "@/components/settings/unauthorized-ui";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/types.ts";

async function SettingsPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const userRole = user.role as Role;

  if (!["admin", "inventory_manager"].includes(userRole)) {
    return <UnauthorizedUI />;
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-slate-900 text-3xl font-bold capitalize">
          System settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage facility information and alert configurations.
        </p>
      </header>

      {/* Settings form goes here */}
      <SettingsForm />
    </section>
  );
}

export default SettingsPage;
