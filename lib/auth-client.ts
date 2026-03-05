import { createAuthClient } from 'better-auth/react'
import { adminClient } from "better-auth/client/plugins"
import { ac, admin, auditor, inventory_manager, user } from "@/lib/permissions"

export const {
    signIn, signOut, useSession, requestPasswordReset, resetPassword, admin: { banUser, unbanUser } }
    = createAuthClient({
        plugins: [
            adminClient({
                ac,
                roles: {
                    admin,
                    auditor,
                    user,
                    inventory_manager
                }
            })
        ]
    })