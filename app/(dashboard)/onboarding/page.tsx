import { OnboardingListing } from "@/components/onboarding/onboarding-listing";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { UnauthorizedUI } from "@/components/onboarding/unauthorized-ui";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { getInvitationRequests } from "@/lib/actions/invitation-request";
import type { Role } from "@/lib/types";

interface OnboardingPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

async function OnboardingPage({ searchParams }: OnboardingPageProps) {
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

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["invitation-requests", "list", currentPage, search],
    queryFn: () => getInvitationRequests({ page: currentPage, search, email:user.email }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-[85vh] flex flex-col flex-1">
        <OnboardingListing
          initialSearch={search}
          currentPage={currentPage}
          userId={user.id}
          email={user.email}
        />
      </div>
    </HydrationBoundary>
  );
}

export default OnboardingPage;
