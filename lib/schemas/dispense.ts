import { z } from "zod";

export const dispenseSchema = z.object({
    medicineId: z.string().min(1, "Please select a medicine"),

    stockEntriesId: z.string().min(1, "Please select a batch"),

    quantity: z
        .number()
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1"),

    patient: z
        .string()
        .min(5, "Patient name must be at least 5 characters")
        .max(30, "Patient name must be less than 30 characters")
        .regex(/^[\p{L}\s]+$/u, "Patient Name can only contain letters and spaces."),

    phone: z.string().regex(/^\+?[0-9]\d{1,14}$/, "Invalid phone number."),

    notes: z
        .string()
        .max(500, "Notes must be less than 500 characters")
        .optional()
        .or(z.literal("")),
});

export type DispenseFormData = z.infer<typeof dispenseSchema>;