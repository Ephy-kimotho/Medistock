"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMedicines,
    getCategoryNames,
    createMedicine,
    updateMedicine,
    archiveMedicine,
    restoreMedicine
} from "@/lib/actions/medicines";
import { toast } from "sonner";
import type { MedicineInput, GetMedicinesParams, StockStatus } from "@/lib/types";


const MedicineKeys = {
    all: ["medicines"] as const,
    lists: () => [...MedicineKeys.all, "list"] as const,
    list: (page: number, search: string, categoryId: string, status: StockStatus) =>
        [...MedicineKeys.lists(), page, search, categoryId, status] as const,
    categories: () => ["category-info"] as const,
};

export const useMedicines = ({
    page,
    search,
    categoryId,
    status,
}: GetMedicinesParams) => {
    return useQuery({
        queryKey: MedicineKeys.list(page, search, categoryId, status),
        queryFn: () => getMedicines({ page, search, categoryId, status }),
    });
};

export const useMedicineCategories = () => {
    return useQuery({
        queryKey: MedicineKeys.categories(),
        queryFn: () => getCategoryNames(),
        staleTime: 10 * 60 * 1000,
    });
};

export const useCreateMedicine = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MedicineInput) => createMedicine(data),
        onSuccess: async (result) => {

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: MedicineKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: MedicineKeys.categories() }),

            ])

            toast.success(result.message);
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "Failed to create medicine";
            toast.error(message);
        },
    });
};

export const useUpdateMedicine = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: MedicineInput }) =>
            updateMedicine(id, data),
        onSuccess: async (result) => {

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: MedicineKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: MedicineKeys.categories() }),

            ])

            toast.success(result.message);
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "Failed to update medicine";
            toast.error(message);
        },
    });
};

export const useArchiveMedicine = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => archiveMedicine(id),
        onSuccess: async (result) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: MedicineKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: MedicineKeys.categories() }),

            ])

            toast.success(result.message);
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "Failed to archive medicine";
            toast.error(message);
        },
    });
};

export const useRestoreMedicine = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => restoreMedicine(id),
        onSuccess: async (result) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: MedicineKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: MedicineKeys.categories() }),

            ])

            toast.success(result.message);
        },
        onError: (error) => {
            const message = error.message
            toast.error(message);
        },
    });
};