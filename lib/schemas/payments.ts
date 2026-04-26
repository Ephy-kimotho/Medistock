import { z } from "zod";

export const addPaymentSchema = z
    .object({
        transactionId: z.string().min(1, "Transaction ID is required"),
        method: z.enum(["cash", "mpesa", "card", "insurance"], {
            error: "Please select a payment method",
        }),
        amount: z.number().positive().optional(),
        paymentCode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.method !== "cash" && (!data.paymentCode || data.paymentCode.trim() === "")) {
            ctx.addIssue({
                code: "custom",
                message: "Payment code is required",
                path: ["paymentCode"],
            });
        }
    });

export type AddPaymentFormData = z.infer<typeof addPaymentSchema>;