import { useState } from "react";
import { Mail, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn, formatRole } from "@/lib/utils";
import { useResendInvite } from "@/hooks/useInvitations";
import type { Invitations } from "@/lib/types";

export function InvitationsTable({
  invitations,
}: {
  invitations: Invitations;
}) {
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

  return (
    <div className="mt-4 rounded-lg border border-border overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="font-bold bg-muted">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Invite Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>{invitation.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="text-muted-foreground size-4" />
                  <span>{invitation.email}</span>
                </div>
              </TableCell>
              <TableCell>{formatRole(invitation.role)}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    invitation.isExpired
                      ? "bg-crimson-red/10 border-crimson-red text-crimson-red"
                      : "bg-medium-jungle/10 border-medium-jungle text-medium-jungle",
                  )}
                >
                  {invitation.isExpired ? "Expired" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={invitation.email === resendEmail && isPending}
                  onClick={() =>
                    handleResendInvite(invitation.token, invitation.email)
                  }
                >
                  {invitation.email === resendEmail && isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader className="size-4 animate-spin" />
                      resending...
                    </span>
                  ) : (
                    "Resend Invite"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
