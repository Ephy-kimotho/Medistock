import { InvitationsListing } from "@/components/invitations/invitations-listing";
import { UnauthorizedUI } from "@/components/invitations/unauthorized-ui";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { getInvitations } from "@/lib/actions/invitations";
import type { Role } from "@/lib/types";

interface InvitationsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
  }>;
}

async function InvitationsPage({ searchParams }: InvitationsPageProps) {
  const session = await getServerSession();

  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const userRole = user.role as Role;

  if (!["hr", "admin"].includes(userRole)) {
    return <UnauthorizedUI />;
  }

  const params = await searchParams;

  const currentPage = Number(params.page) || 1;
  const search = params.search || "";
  const role = params.role || "all";

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["invitations", "list", currentPage, search, role],
    queryFn: () => getInvitations({ page: currentPage, search, role }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-[85vh] flex flex-col flex-1">
        <InvitationsListing
          initialSearch={search}
          initialRole={role}
          currentPage={currentPage}
        />
      </div>
    </HydrationBoundary>
  );
}

export default InvitationsPage;
