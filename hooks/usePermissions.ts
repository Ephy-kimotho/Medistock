import { useSession } from "@/lib/auth-client";
import type { Role } from "@/lib/types";

export function usePermissions() {
  const { isPending, data: session } = useSession();

  const userRole = (session?.user?.role as Role) || "user";
  const currentUser = session?.user;

  const isHR = userRole === "hr";
  const isAdmin = userRole === "admin";
  const isInventoryManager = userRole === "inventory_manager";
  const isUser = userRole === "user";
  const isAuditor = userRole === "auditor";


  const canManageInvitations = isHR || isAdmin;
  const canCreateRequests = isHR;
  const canSendInvites = isHR || isAdmin;
  const canManageUsers = isAdmin;
  const canViewUsers = isAdmin || isHR;
  const canManageSettings = isAdmin;
  const canViewAlerts = isAdmin || isInventoryManager;
  const canViewReports = isAdmin || isInventoryManager || isAuditor || isHR;

  return {
    isSessionPending: isPending,
    role: userRole,
    currentUser,
    isHR,
    isAdmin,
    isInventoryManager,
    isUser,
    isAuditor,
    canManageInvitations,
    canCreateRequests,
    canSendInvites,
    canManageUsers,
    canViewUsers,
    canManageSettings,
    canViewAlerts,
    canViewReports,
  };
}