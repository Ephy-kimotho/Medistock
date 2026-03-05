import { z } from "zod";

const USER_ROLES = ["user", "admin", "auditor", "inventory_manager"] as const

export const userInvitationSchema = z.object({
    invitedById: z.string().min(1, "Invitor id is required."),
    name: z.string()
        .min(3, "Name should have at least 3 characters.")
        .max(20, "Name should atmost have 20 characters")
        .regex(/^[\p{L}\s]+$/u, "Name can only contain letters and spaces."),
    email: z.email("Please enter a valid email address."),
    role: z.enum(USER_ROLES, {
        error: "Please select a valid role."
    })
})

export const invitationSchema = z.object({
    name: z.string()
        .min(3, "Fullname should have at least 3 characters.")
        .max(20, "Name should atmost have 20 characters")
        .regex(/^[\p{L}\s]+$/u, "Name can only contain letters and spaces."),
    email: z.email("Please enter a valid email address."),
    role: z.enum(USER_ROLES, {
        error: "Please select a valid role."
    })
})

export const acceptInvitationSchema = z.object({
    name: z.string()
        .min(3, "Name should have at least 3 characters.")
        .max(20, "Name should atmost have 20 characters")
        .regex(/^[\p{L}\s]+$/u, "Name can only contain letters and spaces."),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(/[\W_]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const loginSchema = z.object({
    email: z.email("Please enter a valid email address."),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(/[\W_]/, 'Password must contain at least one special character'),

})

export const forgotPasswordSchema = z.object({
    email: z.email()
})

export const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(/[\W_]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const changePasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(/[\W_]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type Login = z.infer<typeof loginSchema>
export type ChangePassword = z.infer<typeof changePasswordSchema>
export type ResetPassword = z.infer<typeof resetPasswordSchema>
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>
export type AcceptInvitation = z.infer<typeof acceptInvitationSchema>
export type InvitationType = z.infer<typeof invitationSchema>
export type UserInvitationType = z.infer<typeof userInvitationSchema>