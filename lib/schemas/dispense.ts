
import { z } from "zod";
import { NAME_PATTERN, PHONE_PATTERN } from "@/lib/utils";

export const dispenseSchema = z
  .object({
    medicineId: z.string().min(1, "Please select a medicine"),
    stockEntriesId: z.string().min(1, "Please select a batch"),
    quantity: z
      .number({ error: "Quantity is required" })
      .int("Quantity must be a whole number")
      .positive("Quantity must be positive"),

    // Patient selection
    isNewPatient: z.boolean(),
    patientId: z.string().optional(),

    // New patient fields
    patient: z.string().optional(),
    phone: z.string().optional(),
    patientAgeGroup: z
      .enum(["infant", "pediatric", "adult", "geriatric"])
      .optional(),

    notes: z.string().min(1, "Dosage is required"),

    // Payment fields
    collectPayment: z.boolean(),
    paymentMethod: z.enum(["cash", "mpesa", "card", "insurance"]).optional(),
    paymentAmount: z.number().positive().optional(), 
    paymentCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate new patient fields
    if (data.isNewPatient) {
      if (!data.patient || data.patient.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Patient name is required",
          path: ["patient"],
        });
      } else if (!NAME_PATTERN.test(data.patient)) {
        ctx.addIssue({
          code: "custom",
          message: "Name can only contain letters, spaces, and apostrophes",
          path: ["patient"],
        });
      }

      if (!data.phone || data.phone.trim().length < 7) {
        ctx.addIssue({
          code: "custom",
          message: "Phone number is required",
          path: ["phone"],
        });
      } else if (!PHONE_PATTERN.test(data.phone)) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid phone number format",
          path: ["phone"],
        });
      }

      if (!data.patientAgeGroup) {
        ctx.addIssue({
          code: "custom",
          message: "Patient age group is required",
          path: ["patientAgeGroup"],
        });
      }
    } else {
      // Returning patient - must select a patient
      if (!data.patientId) {
        ctx.addIssue({
          code: "custom",
          message: "Please select a patient",
          path: ["patientId"],
        });
      }
    }

    // Payment validation
    if (data.collectPayment) {
      if (!data.paymentMethod) {
        ctx.addIssue({
          code: "custom",
          message: "Payment method is required",
          path: ["paymentMethod"],
        });
      }

      // Note: paymentAmount is now auto-calculated, no validation needed here

      if (
        data.paymentMethod &&
        data.paymentMethod !== "cash" &&
        (!data.paymentCode || data.paymentCode.trim() === "")
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Payment code is required",
          path: ["paymentCode"],
        });
      }
    }
  });

export type DispenseFormData = z.infer<typeof dispenseSchema>;