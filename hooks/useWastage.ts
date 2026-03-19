"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBatchesForWastage, recordWastage } from "@/lib/actions/wastage";
import { getMedicineNames } from "@/lib/actions/stock-inventory";
import { toast } from "sonner";
import type { WastageInput } from "@/lib/types";

export const WastageKeys = {
    medicines: ["medicine-info"] as const,
    batches: (medicineId: string) => ["wastage", "batches", medicineId] as const,
};

// GET the medicine names for form display
export const useWastageMedicines = () => {
    return useQuery({
        queryKey: WastageKeys.medicines,
        queryFn: () => getMedicineNames(),
    });
};

// GET the batches for the selected medicine ID
export const useBatchesForWastage = (medicineId: string) => {
    return useQuery({
        queryKey: WastageKeys.batches(medicineId),
        queryFn: () => getBatchesForWastage(medicineId),
        enabled: !!medicineId,
    });
};

// POST record medicine wastage
export const useRecordWastage = () => {
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
            await queryClient.invalidateQueries({
                queryKey: ["stock-inventory"],
            });

            toast.success(result.message);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};