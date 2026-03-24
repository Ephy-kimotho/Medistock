"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMedicineNames, addNewStock, getStockInventory } from "@/lib/actions/stock-inventory";
import { toast } from "sonner"
import type { StockInput } from "@/lib/types"

export const StockInventoryKeys = {
    all: ["stock-inventory"] as const,
    lists: () => [...StockInventoryKeys.all, "list"] as const,
    list: (filters: {
        page: number;
        search: string;
        medicineId: string;
        status: string;
    }) => [...StockInventoryKeys.lists(), filters] as const,
    medicines: ["medicine-info"] as const,
}

// GET medicines names and ID for the add stock form
export const useMedicineNames = () => {
    return useQuery({
        queryKey: StockInventoryKeys.medicines,
        queryFn: async () => {
            return await getMedicineNames()
        }
    })
}

// GET stock/batch data
export const useStockInventory = ({
    page,
    search,
    medicineId,
    status,
}: {
    page: number;
    search: string;
    medicineId: string;
    status: string;
}) => {
    return useQuery({
        queryKey: StockInventoryKeys.list({ page, search, medicineId, status }),
        queryFn: () => getStockInventory({ page, search, medicineId, status }),
    });
};

// ADD new stock/batch
export const useAddStock = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ stock, userId }: { stock: StockInput, userId: string }) => {
            return await addNewStock(stock, userId)
        },
        onSettled: async (data) => {

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["transactions", "stats"]
                }),
                
                queryClient.invalidateQueries({
                    queryKey: StockInventoryKeys.lists()
                })
            ])

            toast.success(data?.message)

        },
        onError(error) {
            toast.error(error.message)
        },
    })
}
