import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from '@/lib/prisma'
import { admin as adminPlugin } from "better-auth/plugins"
import { ac, admin, auditor, inventory_manager, user } from "@/lib/permissions"
import { sendPasswordResetLinkEmail } from "@/lib/actions/emails"


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    session: {
        expiresIn: 60 * 60 * 24
    },
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
        resetPasswordTokenExpiresIn: 900,
        sendResetPassword: async ({ url, user }) => {
            try {
                await sendPasswordResetLinkEmail({
                    email: user.email,
                    resetURL: url,
                    name: user.name
                })
            } catch (error) {
                console.error('Failed to send password reset email:', error);
                throw error;
            }

        },
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