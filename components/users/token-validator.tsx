import { prisma } from "@/lib/prisma";
import { AcceptInviteForm } from "./accept-form";
import { InvalidTokenUI } from "./invalid-token";
import { ExpiredTokenUI } from "./expired-token";
import { isAfter } from "date-fns";

interface TokenValidatorProps {
  token: string;
}

export async function TokenValidator({ token }: TokenValidatorProps) {
  const invitation = await prisma.invitation.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      acceptedAt: true,
      expiresAt: true,
    },
  });

  // Invitation not found
  if (!invitation) {
    return (
      <InvalidTokenUI message="This invitation link is invalid or has already been used." />
    );
  }

  // Token has already been used
  if (invitation.acceptedAt !== null) {
    return (
      <InvalidTokenUI message="This invitation has already been accepted.Please sign in to your account." />
    );
  }

  // Check token expiry
  if (isAfter(new Date(), invitation.expiresAt)) {
    return <ExpiredTokenUI />;
  }

  // Token is valid, show the accept invite form
  return (
    <AcceptInviteForm
      token={token}
      email={invitation.email}
      name={invitation.name}
      role={invitation.role}
    />
  );
}
