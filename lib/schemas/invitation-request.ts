import { z } from "zod";

export const invitationRequestSchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be at most 50 characters")
        .regex(/^[\p{L}\s]+$/u, "Name can only contain letters and spaces"),
    email: z.email("Please enter a valid email address"),
    role: z.enum(["admin", "inventory_manager", "user", "auditor"]),
    employeeId: z.string()
        .min(4, "Employee ID must be at least 4 characters"),
});

export type InvitationRequestInput = z.infer<typeof invitationRequestSchema>;