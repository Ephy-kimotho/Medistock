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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  MoreVertical,
  ShieldUser,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { cn, formatRole } from "@/lib/utils";
import type { User } from "@/lib/types";

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="mt-4 rounded-lg border border-border overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="font-bold bg-muted">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Date Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="capitalize">{user.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="text-muted-foreground size-4" />
                  <span>{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    "py-1 px-3",
                    user.role === "admin" &&
                      "bg-crimson-red/10 text-crimson-red",
                    user.role === "auditor" &&
                      "bg-purple-500/10 text-purple-500",
                    user.role === "inventory_manager" &&
                      "bg-princeton-orange/10 text-princeton-orange",
                    user.role === "user" && "bg-azure/10 text-azure",
                  )}
                >
                  {formatRole(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(user.createdAt), "dd/MM/yyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="size-8 p-0">
                      <MoreVertical className="size-4 text-night" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                      Promotions
                    </DropdownMenuLabel>

                    {user.role !== "admin" && (
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <ShieldUser className="size-4 text-muted-foreground" />
                        <span className="text-sm">Make Admin</span>
                      </DropdownMenuItem>
                    )}

                    {user.role !== "inventory_manager" && (
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Shield className="size-4 text-muted-foreground" />
                        <span className="text-sm">Make Inventory Manager</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                      Demotions
                    </DropdownMenuLabel>

                    {user.role !== "user" && (
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-amber-600 focus:text-amber-600">
                        <UserIcon className="size-4" />
                        <span className="text-sm">Demote to User</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
