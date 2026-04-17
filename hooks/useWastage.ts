"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getBatchesForWastage,
    recordWastage,
    getExpiredBatches,
} from "@/lib/actions/wastage";
import { getMedicineNames } from "@/lib/actions/stock-inventory";
import { toast } from "sonner";
import type { WastageInput } from "@/lib/types";

export const WastageKeys = {
    all: ["wastage"] as const,
    medicines: ["medicine-info"] as const,
    batches: (medicineId: string) => ["wastage", "batches", medicineId] as const,
    expiredBatches: ["wastage", "expired-batches"] as const,
};

// GET the medicine names for form display
export function useWastageMedicines() {
    return useQuery({
        queryKey: WastageKeys.medicines,
        queryFn: () => getMedicineNames(),
    });
}

// GET the batches for the selected medicine ID
export function useBatchesForWastage(medicineId: string) {
    return useQuery({
        queryKey: WastageKeys.batches(medicineId),
        queryFn: () => getBatchesForWastage(medicineId),
        enabled: !!medicineId,
    });
}

// GET expired batches that need to be recorded as wastage
export function useExpiredBatches() {
    return useQuery({
        queryKey: WastageKeys.expiredBatches,
        queryFn: () => getExpiredBatches(),
    });
}

// POST record medicine wastage
export function useRecordWastage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            data,
            userId,
        }: {
            data: WastageInput;
            userId: string;
        }) => {
            return await recordWastage(data, userId);
        },
        onSuccess: async (result) => {
            // Invalidate all related queries
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: WastageKeys.expiredBatches,
                }),
                queryClient.invalidateQueries({
                    queryKey: WastageKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: ["transactions"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["stock-inventory"],
                }),
            ]);

            toast.success(result.message);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}