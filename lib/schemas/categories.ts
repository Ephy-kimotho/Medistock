import { z } from "zod";

export const categorySchema = z
    .object({
        // Form fields schema definitions
        categorySelect: z.string().min(1, "Please select a category"),
        customName: z.string().optional(),
        descriptionSelect: z.enum(["default", "other"]),
        customDescription: z.string().optional(),
    })
    .refine(
        (data) => {
            // If category is "other", customName is required
            if (data.categorySelect === "other") {
                return data.customName && data.customName.trim().length >= 5;
            }
            return true;
        },
        {
            message: "Custom category name must be at least 5 characters",
            path: ["customName"],
        }
    )
    .refine(
        (data) => {
            // If category is "other" OR description is "other", customDescription is required
            if (data.categorySelect === "other" || data.descriptionSelect === "other") {
                return data.customDescription && data.customDescription.trim().length >= 10;
            }
            return true;
        },
        {
            message: "Description must be at least 10 characters",
            path: ["customDescription"],
        }
    );

export type CategoryFormData = z.infer<typeof categorySchema>;
