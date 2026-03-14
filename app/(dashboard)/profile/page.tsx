import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Mail, Shield, Calendar, IdCard } from "lucide-react";
import { format } from "date-fns";
import { getUserProfile } from "@/lib/actions/users";
import { getServerSession } from "@/lib/check-permissions";
import { NoSessionUI } from "./no-session-ui";
import { QuickActions } from "./quick-action";
import { AlertConfig } from "./alert-config";
import { UserNotFoundUI } from "./no-user-ui";
import { cn, formatRole } from "@/lib/utils";

async function ProfilePage() {
  const session = await getServerSession();
  const userId = session?.user.id;

  if (!userId) {
    return <NoSessionUI />;
  }

  const user = await getUserProfile(userId);

  if (!user) {
    return <UserNotFoundUI />;
  }

  const isAdminOrManager =
    user.role === "admin" || user.role === "inventory_manager";

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-slate-900 text-3xl font-bold capitalize">
          My profile
        </h2>
        <p className="text-sm text-muted-foreground">
          View and manage your account information
        </p>
      </header>

      {/* Banner */}
      <Card className="bg-white rounded-lg border border-border p-6 sm:p-8">
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <UserIcon
                className="w-12 h-12 text-primary-foreground"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
            <div className="mt-2">
              <Badge
                variant="secondary"
                className={cn(
                  "py-1.5 px-3",
                  user.role === "admin" ||
                    (user.role === "hr" &&
                      "bg-crimson-red/10 text-crimson-red border-crimson-red"),
                  user.role === "auditor" &&
                    "bg-purple-500/10 text-purple-500 border-purple-500",
                  user.role === "inventory_manager" &&
                    "bg-princeton-orange/10 text-princeton-orange border-princeton-orange",
                  user.role === "user" && "bg-azure/10 text-azure border-azure",
                )}
              >
                {formatRole(user.role || "user")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      <Card className="bg-white rounded-lg border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Row 1: Name, Email and Employee ID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Full Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <UserIcon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Full Name
                </p>
                <p className="text-base font-semibold text-foreground">
                  {user.name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email
                </p>
                <p className="text-base font-semibold text-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            {/*Employee ID*/}
            {user.employeeId && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <IdCard className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Employee ID
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {user.employeeId}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Role and Member Since */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Role */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  User Role
                </p>
                <p className="text-base font-semibold text-foreground">
                  {formatRole(user.role || "user")}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Member Since
                </p>
                <p className="text-base font-semibold text-foreground">
                  {format(new Date(user.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email config alerts for admins and inventory managers */}
      {isAdminOrManager && (
        <AlertConfig
          userId={userId}
          initialValue={user.emailAlertEnabled ?? false}
        />
      )}

      {/* Quick Actions */}
      <QuickActions userId={userId} />
    </section>
  );
}

export default ProfilePage;
