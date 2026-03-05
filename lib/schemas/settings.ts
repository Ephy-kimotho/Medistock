import { z } from "zod";

export const settingsSchema = z.object({
    facilityName: z.string()
        .min(3, "Name should have at least 3 characters.")
        .max(50, "Name should have at most 50 characters")
        .regex(/^[\p{L}\s]+$/u, "Name can only contain letters and spaces."),
    facilityAddress: z.string()
        .min(3, "Address should have at least 3 characters.")
        .max(100, "Address should have at most 100 characters"),
    expiryWarnDays: z.number()
        .min(1, "Warning threshold must be at least 1 day")
        .max(90, "Warning threshold cannot exceed 90 days"),
    criticalExpiryWarnDays: z.number()
        .min(1, "Critical threshold must be at least 1 day")
        .max(30, "Critical threshold cannot exceed 30 days"),
}).refine((data) => data.criticalExpiryWarnDays < data.expiryWarnDays, {
    message: "Critical threshold must be less than warning threshold",
    path: ["criticalExpiryWarnDays"],
});

export type Settings = z.infer<typeof settingsSchema>;