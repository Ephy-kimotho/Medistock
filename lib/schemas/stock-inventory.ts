import { z } from "zod";

export const stockSchema = z.object({
    medicineId: z.string().min(1, "Please select a medicine"),

    batchNumber: z
        .string()
        .min(3, "Batch number must be at least 3 characters")
        .max(50, "Batch number must be less than 50 characters"),

    quantity: z
        .number()
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1"),

    expiryDate: z.date({
        error: "Expiry date is required",

    }).refine(
        (date) => date > new Date(),
        "Expiry date must be in the future"
    ),

    purchaseDate: z.date({
        error: "Purchase date is required",
    }),

    purchasePrice: z
        .number()
        .min(0, "Purchase price cannot be negative"),

    supplier: z
        .string()
        .max(100, "Supplier name must be less than 100 characters")
        .optional()
        .or(z.literal("")),

    notes: z
        .string()
        .max(500, "Notes must be less than 500 characters")
        .optional()
        .or(z.literal("")),
});

export type StockFormData = z.infer<typeof stockSchema>;