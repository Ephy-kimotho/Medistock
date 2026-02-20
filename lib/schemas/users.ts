import { z } from "zod";

const USER_ROLES = ["user", "admin", "auditor", "inventory_manager"] as const

export const userInvitationSchema = z.object({
    invitedById: z.string(),
    name: z.string().min(3, "Name should have at least 3 characters."),
    email: z.email("Please enter a valid email address."),
    role: z.enum(USER_ROLES, {
        error: "Please select a valid role."
    })
})


export const invitationSchema = z.object({
    name: z.string().min(3, "Name should have at least 3 characters."),
    email: z.email("Please enter a valid email address."),
    role: z.enum(USER_ROLES, {
        error: "Please select a valid role."
    })
})

export type InvitationType = z.infer<typeof invitationSchema>
export type UserInvitationType = z.infer<typeof userInvitationSchema>