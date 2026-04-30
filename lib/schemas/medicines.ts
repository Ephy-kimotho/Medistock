import { z } from "zod";
import { MEDICINE_UNIT_VALUES, frequencyValues } from "@/constants";


export const medicineSchema = z
  .object({
    name: z
      .string()
      .min(3, "Medicine name must be at least 3 characters")
      .max(100, "Medicine name must be less than 100 characters"),

    unit: z.enum(MEDICINE_UNIT_VALUES, {
      message: "Please select a valid unit type",
    }),

    reorderlevel: z
      .number({
        error: "Reorder level is needed"
      })
      .int("Reorder level must be a whole number")
      .min(0, "Reorder level cannot be negative"),

    categoryId: z.string().min(1, "Please select a category"),
    ageGroup: z.enum(["infant", "pediatric", "adult", "geriatric", "all_ages"]),

    // Dosage fields
    dosageQuantity: z
      .number({
        error: "Dosage quantity is needed"
      })
      .int("Must be a whole number")
      .min(1, "Must be at least 1")
      .nullable(),
    dosageFrequency: z.enum(frequencyValues).nullable(),
    dosageDays: z
      .number({
        error: "Dosage days is needed"
      })
      .int("Must be a whole number")
      .min(1, "Must be at least 1 day")
      .nullable(),

    unitPrice: z
      .number({ message: "Unit price is required" })
      .int("Unit price must be a whole number")
      .min(1, "Unit price must be at least 1"),

    manufacturer: z
      .string()
      .max(100, "Manufacturer name must be less than 100 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // If frequency requires days (all except as_needed), dosageDays must be provided
      if (data.dosageFrequency && data.dosageFrequency !== "as_needed") {
        return data.dosageDays !== null && data.dosageDays !== undefined;
      }
      return true;
    },
    {
      message: "Number of days is required for this frequency",
      path: ["dosageDays"],
    }
  )
  .refine(
    (data) => {
      // If dosageFrequency is set, dosageQuantity must also be set
      if (data.dosageFrequency) {
        return data.dosageQuantity !== null && data.dosageQuantity !== undefined;
      }
      return true;
    },
    {
      message: "Dosage quantity is required when frequency is set",
      path: ["dosageQuantity"],
    }
  )
  .refine(
    (data) => {
      // If dosageQuantity is set, dosageFrequency must also be set
      if (data.dosageQuantity) {
        return data.dosageFrequency !== null && data.dosageFrequency !== undefined;
      }
      return true;
    },
    {
      message: "Frequency is required when dosage quantity is set",
      path: ["dosageFrequency"],
    }
  );

export type MedicineFormData = z.infer<typeof medicineSchema>;