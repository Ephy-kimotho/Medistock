import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getPendingPayments,
    addPaymentToTransaction,
    getPendingPaymentsCount,
} from "@/lib/actions/payments";
import { toast } from "sonner";
import type { AddPaymentInput } from "@/lib/types"

export const PendingPaymentsKeys = {
    all: ["pending-payments"] as const,
    list: (page: number, search: string) =>
        [...PendingPaymentsKeys.all, "list", page, search] as const,
    count: ["pending-payments-count"] as const,
};

export function usePendingPayments(page: number, search: string) {
    return useQuery({
        queryKey: PendingPaymentsKeys.list(page, search),
        queryFn: () => getPendingPayments({ page, search }),
    });
}

export function usePendingPaymentsCount() {
    return useQuery({
        queryKey: PendingPaymentsKeys.count,
        queryFn: () => getPendingPaymentsCount(),
    });
}

export function useAddPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data, userId }: { data: AddPaymentInput, userId: string }) => addPaymentToTransaction(data, userId),
        onSuccess: async (result) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: PendingPaymentsKeys.all }),
                queryClient.invalidateQueries({ queryKey: PendingPaymentsKeys.count })
            ])

            toast.success(result.message);

        },
        onError: (error) => {
            const errorMessage = error.message
            toast.error(errorMessage, {
                duration: 6000
            });
        },
    });
}