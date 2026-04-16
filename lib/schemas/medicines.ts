import { z } from "zod";
import { MEDICINE_UNIT_VALUES } from "@/constants";

export const medicineSchema = z.object({
    name: z
        .string()
        .min(3, "Medicine name must be at least 3 characters")
        .max(100, "Medicine name must be less than 100 characters"),

    unit: z.enum(MEDICINE_UNIT_VALUES, {
        error: "Please select a valid unit type"
    }),

    reorderlevel: z
        .number()
        .int("Reorder level must be a whole number")
        .min(0, "Reorder level cannot be negative"),

    categoryId: z.string().min(1, "Please select a category"),
    ageGroup: z.enum(["infant", "pediatric", "adult", "geriatric", "all_ages"]),

    manufacturer: z
        .string()
        .max(100, "Manufacturer name must be less than 100 characters")
        .optional()
        .or(z.literal("")),
});

export type MedicineFormData = z.infer<typeof medicineSchema>;