import z from "zod"

export const categorySchema = z.object({
    name: z.string()
        .min(3, "Name should have at least 3 characters.")
        .max(50, "Name should have at most 50 characters")
        .regex(/^[\p{L}\s]+$/u, "Name can only contain letters and spaces."),
    description: z.string()
        .min(3, "Description should have at least 3 characters.")
        .max(500, "Description should have at most 500 characters")
        .optional()
})



export type CategoryType = z.infer<typeof categorySchema>