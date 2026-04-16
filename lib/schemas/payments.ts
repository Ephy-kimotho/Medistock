import { z } from "zod";

export const addPaymentSchema = z
    .object({
        transactionId: z.string().min(1, "Transaction ID is required"),
        method: z.enum(["cash", "mpesa", "card", "insurance"]),
        amount: z
            .number()
            .int("Amount must be a whole number")
            .min(1, "Amount must be at least 1"),
        paymentCode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.method !== "cash" && !data.paymentCode) {
            ctx.addIssue({
                code: "custom",
                message: "Payment code is required",
                path: ["paymentCode"],
            });
        }
    });

export type AddPaymentFormData = z.infer<typeof addPaymentSchema>;