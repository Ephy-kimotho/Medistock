import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { getPendingPayments } from "@/lib/actions/payments";
import { PendingPaymentsListing } from "@/components/payments/pending-payments-listing";
import { UnauthorizedUI } from "./unauthorized-ui";
import type { Role } from "@/lib/types";

interface PendingPaymentsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function PendingPaymentsPage({
  searchParams,
}: PendingPaymentsPageProps) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const userRole = user.role as Role;

  const { page, search } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;
  const searchTerm = search ?? "";

  const data = await getPendingPayments({
    page: currentPage,
    search: searchTerm,
  });

  if (userRole === "hr" || userRole === "auditor") {
    return <UnauthorizedUI />;
  }

  return (
    <section className="flex-1 flex flex-col gap-6">
      <header>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Pending Payments
            </h1>
            <p className="text-sm text-muted-foreground">
              {data.totalCount} dispense{data.totalCount !== 1 && "s"} awaiting
              payment
            </p>
          </div>
        </div>
      </header>

      <PendingPaymentsListing data={data} searchTerm={searchTerm} />
    </section>
  );
}
