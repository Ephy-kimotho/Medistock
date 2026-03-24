"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBatchesByMedicine, dispenseMedicine } from "@/lib/actions/dispense";
import { getMedicineNames } from "@/lib/actions/stock-inventory";
import { toast } from "sonner";
import type { DispenseInput } from "@/lib/types";

export const DispenseKeys = {
    medicines: ["medicine-info"] as const,
    batches: (medicineId: string) => ["dispense", "batches", medicineId] as const,
};

// GET medicines names for form display
export const useDispenseMedicines = () => {
    return useQuery({
        queryKey: DispenseKeys.medicines,
        queryFn: () => getMedicineNames(),
    });
};

// GET medicine batches for form display
export const useBatchesByMedicine = (medicineId: string) => {
    return useQuery({
        queryKey: DispenseKeys.batches(medicineId),
        queryFn: () => getBatchesByMedicine(medicineId),
        enabled: !!medicineId,
    });
};

export const useDispenseMedicine = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            data,
            userId,
        }: {
            data: DispenseInput;
            userId: string;
        }) => {
            return await dispenseMedicine(data, userId);
        },
        onSuccess: async (result) => {
            // Invalidation of queries
            await Promise.all([
                // Invalidate transaction stats
                queryClient.invalidateQueries({
                    queryKey: ["transactions", "stats"]
                }),

                // Invalidate stock inventory
                queryClient.invalidateQueries({
                    queryKey: ["stock-inventory"],
                }),

                // Invalidate batches to refresh available quantities
                queryClient.invalidateQueries({
                    queryKey: ["dispense", "batches"],
                })

            ])

            toast.success(result.message);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};