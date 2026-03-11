"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatRole, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSendInvitation } from "@/hooks/useInvitations";
import { Loader } from "lucide-react";
import type { InvitationRequest } from "@/lib/types";

interface OnboardingTableProps {
  requests: InvitationRequest[];
  invitorId: string;
}

export function OnboardingTable({ requests, invitorId }: OnboardingTableProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const { mutate: sendInvitation, isPending } = useSendInvitation();

  const handleSendInvitation = (requestId: string, email: string) => {
    setInviteEmail(email);

    sendInvitation(
      { requestId, invitorId },
      {
        onSettled: () => {
          setInviteEmail("");
        },
      },
    );
  };

  const getInvitationStatus = (request: InvitationRequest) => {
    if (request.status === "pending") {
      return { label: "Pending", variant: "warning" as const };
    }

    return { label: "Sent", variant: "default" as const };
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Employee ID</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const status = getInvitationStatus(request);

            return (
              <TableRow key={request.id}>
                <TableCell className="font-medium capitalize">
                  {request.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {request.email}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {request.employeeId}
                </TableCell>
                <TableCell>{formatRole(request.role)}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      "px-3 py-1",
                      status.variant === "warning" &&
                        "bg-princeton-orange/10 text-princeton-orange border-princeton-orange",
                      status.variant === "default" &&
                        "bg-azure/10 text-azure border-azure",
                    )}
                  >
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {request.status === "pending" ? (
                    <Button
                      variant="outline"
                      className="px-5"
                      disabled={request.email === inviteEmail && isPending}
                      onClick={() =>
                        handleSendInvitation(request.id, request.email)
                      }
                    >
                      {request.email === inviteEmail && isPending ? (
                        <span className="inline-flex items-center gap-3">
                          <Loader className="size-4 animate-spin text-muted-foreground" />
                          sending...
                        </span>
                      ) : (
                        " Send Invitation"
                      )}
                    </Button>
                  ) : (
                    <Button variant="outline" className="px-5" disabled>
                      Already sent.
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
