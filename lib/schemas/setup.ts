import z from "zod"

export const setupSchema = z.object({
    name: z.string()
        .min(3, "Name should be atleast 3 characters.")
        .max(20, "Name should atmost have 20 characters")
        .regex(/^[\p{L}\s]+$/u, "Name can only contain letters and spaces."),
    email: z.email(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(/[\W_]/, 'Password must contain at least one special character')
})

export type SetupSchema = z.infer<typeof setupSchema>