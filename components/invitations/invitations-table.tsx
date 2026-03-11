"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { RefreshCw, Loader } from "lucide-react";
import { useResendInvite } from "@/hooks/useInvitations";
import { formatRole, cn } from "@/lib/utils";
import { format } from "date-fns";

interface Invitation {
  id: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt: Date | null;
  isExpired: boolean;
  request: {
    name: string;
    email: string;
    role: string;
  };
}

interface InvitationsTableProps {
  invitations: Invitation[];
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
  const [resendEmail, setResendEmail] = useState("");
  const { isPending, mutate } = useResendInvite();

  const handleResendInvite = (token: string, email: string) => {
    setResendEmail(email);

    mutate(token, {
      onSettled: () => {
        setResendEmail("");
      },
    });
  };

  const getStatus = (invitation: Invitation) => {
    if (invitation.isExpired) {
      return { label: "Expired", variant: "destructive" as const };
    }

    return { label: "Pending", variant: "warning" as const };
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold">Sent At</TableHead>
            <TableHead className="font-semibold">Expires At</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const status = getStatus(invitation);

            return (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium capitalize">
                  {invitation.request.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invitation.request.email}
                </TableCell>
                <TableCell>{formatRole(invitation.request.role)}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      "px-3 py-1",
                      status.variant === "warning" &&
                        "bg-princeton-orange/10 text-princeton-orange border-princeton-orange",
                      status.variant === "destructive" &&
                        "bg-crimson-red/10 text-crimson-red border-crimson-red",
                    )}
                  >
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(invitation.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-center">
                  {invitation.isExpired && !invitation.acceptedAt && (
                    <Button
                      className="px-5"
                      variant="outline"
                      disabled={
                        invitation.request.email === resendEmail && isPending
                      }
                      onClick={() =>
                        handleResendInvite(
                          invitation.token,
                          invitation.request.email,
                        )
                      }
                    >
                      {invitation.request.email === resendEmail && isPending ? (
                        <span className="inline-flex gap-2 items-center">
                          <Loader className="size-4 text-muted-foreground animate-spin" />
                          <span>Resending...</span>
                        </span>
                      ) : (
                        <span className="inline-flex gap-2 items-center">
                          <RefreshCw className="size-4 text-muted-foreground" />
                          <span>Resend Invitation</span>
                        </span>
                      )}
                    </Button>
                  )}

                  {!invitation.isExpired && !invitation.acceptedAt && (
                     <Button variant="outline" className="px-5" disabled>
                      Awaiting response.
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
