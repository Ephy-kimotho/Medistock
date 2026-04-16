import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  role: Role;
}

export function QuickActions({ role }: QuickActionsProps) {
  const canAddStock = role === "admin" || role === "inventory_manager";

  return (
    <article
      className={cn(
        "my-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3",
        role === "hr" && "hidden",
      )}
    >
      <Button
        size="lg"
        className={cn("px-8 bg-azure hover:bg-blue-600 text-white")}
        asChild
      >
        <Link href="/transactions/dispense">Dispense Medicine</Link>
      </Button>

      {canAddStock && (
        <Button
          size="lg"
          variant="outline"
          className="px-8 hover:border-azure hover:bg-azure hover:text-white"
          asChild
        >
          <Link href="/inventory">Add Stock</Link>
        </Button>
      )}

      <Button
        size="lg"
        variant="outline"
        className="px-8 hover:border-azure hover:bg-azure hover:text-white"
        asChild
      >
        <Link href="/transactions/wastage">Record Wastage</Link>
      </Button>
    </article>
  );
}
