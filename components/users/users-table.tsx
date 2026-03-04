"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { BanDialog } from "@/components/ban-dialog";
import {
  Mail,
  MoreVertical,
  ShieldUser,
  Shield,
  User as UserIcon,
  Ban,
  Loader,
  CircleCheckBig as Unban,
} from "lucide-react";
import { cn, formatRole } from "@/lib/utils";
import { Alert } from "@/components/alert";
import { useSetUserRole, useUnBanUser } from "@/hooks/useUsers";
import type { User, Role } from "@/lib/types";

interface UserTableProps {
  users: User[];
}

interface RoleChangeConfig {
  userId: string;
  userName: string;
  newRole: Role;
}

// Generate title and description based on new role
function getAlertContent(userName: string, newRole: Role) {
  const content: Record<Role, { title: string; description: string }> = {
    admin: {
      title: "Change Role to Administrator",
      description: `You are about to make ${userName} an Administrator. They will have full access to manage users, view all reports, and configure system settings.`,
    },
    inventory_manager: {
      title: "Change Role to Inventory Manager",
      description: `You are about to make ${userName} an Inventory Manager. They will be able to manage stock, record transactions, and handle medicine inventory.`,
    },
    auditor: {
      title: "Change Role to Auditor",
      description: `You are about to make ${userName} an Auditor. They will have read-only access to reports and transaction history.`,
    },
    user: {
      title: "Change Role to Regular Staff",
      description: `You are about to make ${userName} a Regular Staff member. They will be able to dispense medicines and view basic inventory information.`,
    },
  };

  return content[newRole];
}

export function UserTable({ users }: UserTableProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const unBanMutation = useUnBanUser();

  const [roleChangeConfig, setRoleChangeConfig] =
    useState<RoleChangeConfig | null>(null);

  const { mutate: setUserRole, isPending } = useSetUserRole();

  const handleRoleChangeClick = (
    userId: string,
    userName: string,
    newRole: Role,
  ) => {
    setRoleChangeConfig({ userId, userName, newRole });
    setAlertOpen(true);
  };

  const handleConfirmRoleChange = () => {
    if (!roleChangeConfig) return;

    setUserRole(
      { userId: roleChangeConfig.userId, role: roleChangeConfig.newRole },
      {
        onSettled: () => {
          setAlertOpen(false);
          setRoleChangeConfig(null);
        },
      },
    );
  };

  const alertContent = roleChangeConfig
    ? getAlertContent(roleChangeConfig.userName, roleChangeConfig.newRole)
    : { title: "", description: "" };

  return (
    <>
      <div className="mt-4 rounded-lg border border-border overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="font-bold bg-muted">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="capitalize font-medium">
                  {user.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4 shrink-0" />
                    <span>{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "py-1.5 px-3",
                      user.role === "admin" &&
                        "bg-crimson-red/10 text-crimson-red border-crimson-red",
                      user.role === "auditor" &&
                        "bg-purple-500/10 text-purple-500 border-purple-500",
                      user.role === "inventory_manager" &&
                        "bg-princeton-orange/10 text-princeton-orange border-princeton-orange",
                      user.role === "user" &&
                        "bg-azure/10 text-azure border-azure",
                    )}
                  >
                    {formatRole(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "py-1.5 px-3",
                      user.banned
                        ? "border-lipstick-red bg-lipstick-red/20 text-lipstick-red"
                        : "border-medium-jungle bg-medium-jungle/20 text-medium-jungle",
                    )}
                  >
                    {user.banned ? "Banned" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(user.createdAt), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-8 p-0 hover:bg-muted"
                        disabled={isPending}
                      >
                        <MoreVertical className="size-4 text-muted-foreground" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                          Change User Role
                        </DropdownMenuLabel>

                        {user.role !== "admin" && (
                          <DropdownMenuItem
                            className="hover:bg-azure/20  gap-2 cursor-pointer"
                            onClick={() =>
                              handleRoleChangeClick(user.id, user.name, "admin")
                            }
                          >
                            <ShieldUser className="size-4 text-crimson-red" />
                            <span>Administrator</span>
                          </DropdownMenuItem>
                        )}

                        {user.role !== "inventory_manager" && (
                          <DropdownMenuItem
                            className="hover:bg-azure/20  gap-2 cursor-pointer"
                            onClick={() =>
                              handleRoleChangeClick(
                                user.id,
                                user.name,
                                "inventory_manager",
                              )
                            }
                          >
                            <Shield className="size-4 text-princeton-orange" />
                            <span>Inventory Manager</span>
                          </DropdownMenuItem>
                        )}

                        {user.role !== "auditor" && (
                          <DropdownMenuItem
                            className="hover:bg-azure/20  gap-2 cursor-pointer"
                            onClick={() =>
                              handleRoleChangeClick(
                                user.id,
                                user.name,
                                "auditor",
                              )
                            }
                          >
                            <Shield className="size-4 text-purple-500" />
                            <span>Auditor</span>
                          </DropdownMenuItem>
                        )}

                        {user.role !== "user" && (
                          <DropdownMenuItem
                            className="hover:bg-azure/20  gap-2 cursor-pointer"
                            onClick={() =>
                              handleRoleChangeClick(user.id, user.name, "user")
                            }
                          >
                            <UserIcon className="size-4 text-azure" />
                            <span>Regular Staff</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                          User ban status
                        </DropdownMenuLabel>

                        {user.banned ? (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => {
                              unBanMutation.mutate(user.id);
                            }}
                            disabled={unBanMutation.isPending}
                          >
                            {unBanMutation.isPending ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader className="size-4 animate-spin text-medium-jungle" />
                                <span className="text-sm text-medium-jungle">
                                  Unbanning...
                                </span>
                              </span>
                            ) : (
                              <>
                                <Unban className="size-4 text-medium-jungle" />
                                <span className="text-medium-jungle">
                                  Unban user
                                </span>
                              </>
                            )}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(user);
                              setBanOpen(true);
                            }}
                          >
                            <Ban className="size-4 text-crimson-red" />
                            <span className="text-crimson-red">Ban user</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Alert */}
      <Alert
        open={alertOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setAlertOpen(open);
          }
        }}
        title={alertContent.title}
        descritption={alertContent.description}
        actionType="info"
        action="Confirm"
        actionFn={handleConfirmRoleChange}
        isLoading={isPending}
      />

      {/* Ban Dialog */}
      <BanDialog
        banDialogOpen={banOpen}
        selectedUser={selectedUser}
        setBanOpen={setBanOpen}
        setSelectedUser={setSelectedUser}
      />
    </>
  );
}
