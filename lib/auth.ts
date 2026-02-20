import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/prisma'
import { admin as adminPlugin } from "better-auth/plugins"
import { ac, admin, auditor, inventory_manager, user } from "@/lib/permissions"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: true
    },
    trustedOrigins: ['http://localhost:3000'],
    plugins: [
        adminPlugin({
            ac,
            roles: {
                admin,
                auditor,
                inventory_manager,
                user
            }
        })
    ]
})