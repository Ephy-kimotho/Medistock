"use client";

import { useUsers } from "@/hooks/useUsers";
import { UserRoundX, Loader } from "lucide-react";
import { UserTable } from "./users-table";

function UsersTab() {
  const { data: users, isLoading } = useUsers();

  if (!users || isLoading) {
    return (
      <section className="grid place-items-center py-10">
        <div className="flex flex-col items-center gap-2 ">
          <Loader className="size-6 text-azure animate-spin" />
          <p>Loading users ...</p>
        </div>
      </section>
    );
  }

  if (users.length === 0) {
    <section className="grid place-items-center">
      <div className="grid place-items-center text-muted">
        <UserRoundX className="size-6 text-muted" />
        <p className="text-sm">No users found.</p>
      </div>
    </section>;
  }

  return <UserTable users={users} />;
}

export { UsersTab };
