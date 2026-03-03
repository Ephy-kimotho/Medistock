"use client";

import { useInvitations } from "@/hooks/useInvitations";
import { InvitationsTable } from "./invitations-table";
import { Inbox } from "lucide-react";

function InvitationsTab() {
  const { data: invitations, isLoading } = useInvitations();

  if (!invitations || isLoading) {
    return (
      <div className="grid place-items-center text-muted-foreground text-sm">
        <p>Loading invitations</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <section className="grid place-items-center py-10">
        <div className="space-y-1 grid place-items-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-base">
            No invitations found.
          </p>
        </div>
      </section>
    );
  }

  return <InvitationsTable invitations={invitations} />;
}

export { InvitationsTab };
