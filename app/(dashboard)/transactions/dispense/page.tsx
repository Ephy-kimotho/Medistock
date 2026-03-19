import { getServerSession } from "@/lib/check-permissions";
import { BackButton } from "@/components/transactions/back-button";
import { getMedicineNames } from "@/lib/actions/stock-inventory";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { UnauthorizedUI } from "@/components/transactions/unauthorized-ui";
import { DispenseForm } from "@/components/transactions/dispense-form";

async function DispensePage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) redirect("/login");

  const isAdminOrManagerOrPharmacist =
    user.role === "user" ||
    user.role === "admin" ||
    user.role === "inventory_manager";

  if (!isAdminOrManagerOrPharmacist) {
    return <UnauthorizedUI />;
  }

  // prefetch medicine info on the server
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["medicine-info"],
    queryFn: () => getMedicineNames(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex gap-3 items-center">
          <BackButton />

          <div>
            <h2 className="text-2xl text-slate-900 font-bold">
              Dispense Medicine
            </h2>
            <p className="text-muted-foreground text-pretty">
              Record medicine given to patients
            </p>
          </div>
        </header>

        {/* Dispense form goes here. */}
        <DispenseForm userId={user.id} />
      </div>
    </HydrationBoundary>
  );
}

export default DispensePage;
