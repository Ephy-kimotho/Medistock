import { z } from "zod";
import { REASONS_REQUIRING_NOTES } from "@/constants";

export const wastageSchema = z
    .object({
        medicineId: z.string().min(1, "Please select a medicine"),

        stockEntriesId: z.string().min(1, "Please select a batch"),

        quantity: z
            .number()
            .int("Quantity must be a whole number")
            .min(1, "Quantity must be at least 1"),

        reason: z.enum(["expired", "recalled", "spillage", "damage", "other"], {
            error: "Please select a reason",
        }),

        notes: z
            .string()
            .max(500, "Notes must be less than 500 characters")
            .optional()
            .or(z.literal("")),
    })
    .refine(
        (data) => {
            // If reason requires notes, notes must be provided
            if (REASONS_REQUIRING_NOTES.includes(data.reason)) {
                return data.notes && data.notes.trim().length >= 5;
            }
            return true;
        },
        {
            message: "Please provide additional details (at least 5 characters)",
            path: ["notes"],
        }
    );

export type WastageFormData = z.infer<typeof wastageSchema>;