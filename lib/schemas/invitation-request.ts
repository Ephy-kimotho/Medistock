import { z } from "zod";
import { NAME_PATTERN } from "@/lib/utils";

const phoneRegex = /^\+?(?=(?:\D*\d){7,15}\D*$)[\d\s\-]+$/;

export const invitationRequestSchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be at most 50 characters")
        .regex(NAME_PATTERN, "Name can only contain letters, spaces, and apostrophes"),
    phone: z
        .string()
        .regex(
            phoneRegex,
            "Enter a valid phone number (7-15 digits). Only digits, spaces, hyphens, and a leading + are allowed."
        ),
    email: z.email("Please enter a valid email address"),
    role: z.enum(["admin", "inventory_manager", "user", "auditor"]),
    employeeId: z.string()
        .min(4, "Employee ID must be at least 4 characters"),
});

export type InvitationRequestInput = z.infer<typeof invitationRequestSchema>;