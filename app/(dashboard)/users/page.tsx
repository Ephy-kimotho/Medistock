
import { InvitationForm } from "@/components/users/invite-form"
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react"
 
function Users() {
  return (
    <section className="space-y-4 min-h-screen">
      <header className="space-y-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

        <InvitationForm>
          <Button className="h-0 py-5 px-8 bg-azure hover:bg-primary inline-flex items-center gap-2">
            <UserPlus className="size-4"/>
            Invite user
          </Button>

        </InvitationForm>
      </header>
    </section>
  );
}

export default Users;
