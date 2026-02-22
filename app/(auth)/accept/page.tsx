import { Suspense } from "react";
import { NoTokenUI } from "@/components/users/no-invite-token";
import { TokenValidator } from "@/components/users/token-validator";
import { AcceptFormSkeleton } from "@/components/users/accept-skeleton";

interface AcceptInviteProps {
  searchParams: Promise<{ token: string }>;
}

export default async function AcceptInvite({
  searchParams,
}: AcceptInviteProps) {
  const { token } = await searchParams;

  // if no token show no token UI
  if (!token) {
    return <NoTokenUI />;
  }

  // If token exists, validate it inside Suspense
  // User sees skeleton immediately while validation happens
  return (
    <Suspense fallback={<AcceptFormSkeleton />}>
      <TokenValidator token={token} />
    </Suspense>
  );
}
