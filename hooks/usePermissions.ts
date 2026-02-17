import { useSession } from "@/lib/auth-client";
import type { Role } from "@/lib/types"

export function usePermissions() {

    const { isPending, data: session } = useSession()

    const userRole = (session?.user?.role as Role) || "user"
    const currentUser = session?.user

    const isUser = userRole === "user"
    const isAdmin = userRole === "admin"
    const isAuditor = userRole === "auditor"
    const isInventoryManager = userRole === "inventoryManager"

    return {
        isSessionPending: isPending,
        role: userRole,
        currentUser,
        isAdmin,
        isAuditor,
        isInventoryManager,
        isUser
    }
}