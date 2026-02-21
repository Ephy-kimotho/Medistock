import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from '@/lib/prisma'
import { admin as adminPlugin } from "better-auth/plugins"
import { ac, admin, auditor, inventory_manager, user } from "@/lib/permissions"


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    session: {
        expiresIn: 60 * 60 * 24
    },
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
        }),
        nextCookies()
    ]
})