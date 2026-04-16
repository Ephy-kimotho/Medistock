"use server"

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function generateCashPaymentCode() {
    const datePrefix = format(new Date(), "yyyyMMdd");
    const prefix = `CASH-${datePrefix}`;

    const lastCashPayment = await prisma.payment.findFirst({
        where: {
            paymentCode: { startsWith: prefix },
        },
        orderBy: { paymentCode: "desc" },
    });

    const lastSequence = lastCashPayment
        ? parseInt(lastCashPayment.paymentCode.split("-")[2])
        : 0;

    const newSequence = String(lastSequence + 1).padStart(4, "0");

    return `${prefix}-${newSequence}`;
}