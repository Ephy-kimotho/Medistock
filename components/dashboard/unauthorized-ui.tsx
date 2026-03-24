import { ShieldX } from "lucide-react";

export function UnauthorizedUI() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-crimson-red/10 p-4 mb-4">
        <ShieldX className="size-12 text-crimson-red" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Access Restricted
      </h2>
      <p className="text-muted-foreground max-w-md">
        As an auditor, you have read-only access to reports and audit logs. The
        dashboard is not available for your role.
      </p>
    </div>
  );
}
