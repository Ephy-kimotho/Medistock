import { z } from "zod";

export const dispenseSchema = z
  .object({
    medicineId: z.string().min(1, "Medicine is required"),
    stockEntriesId: z.string().min(1, "Batch is required"),
    quantity: z
      .number()
      .int("Quantity must be a whole number")
      .min(1, "Quantity must be at least 1"),
    patient: z
      .string()
      .min(2, "Patient name must be at least 2 characters")
      .max(100, "Patient name must be at most 100 characters"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be at most 15 digits"),
    patientAgeGroup: z.enum(["infant", "pediatric", "adult", "geriatric"]),
    notes: z.string().min(1, "Dosage is required"),


    // Payment fields (optional)
    collectPayment: z.boolean(),
    paymentMethod: z.enum(["cash", "mpesa", "card", "insurance"]).optional(),
    paymentAmount: z
      .number()
      .int("Amount must be a whole number")
      .min(1, "Amount must be at least 1")
      .optional(),
    paymentCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.collectPayment) {
      if (!data.paymentMethod) {
        ctx.addIssue({
          code: "custom",
          message: "Payment method is required",
          path: ["paymentMethod"],
        });
      }
      if (!data.paymentAmount || data.paymentAmount < 1) {
        ctx.addIssue({
          code: "custom",
          message: "Payment amount is required",
          path: ["paymentAmount"],
        });
      }
      if (
        data.paymentMethod &&
        data.paymentMethod !== "cash" &&
        !data.paymentCode
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