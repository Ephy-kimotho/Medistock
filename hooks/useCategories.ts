"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    createCategory,
    getCategories,
    updateCategory,
    archiveCategory,
    restoreCategory
} from "@/lib/actions/categories"
import { toast } from "sonner"
import type { CreateCategory, UpdateCategory } from "@/lib/types"

export const CategoryKeys = {
    all: ["categories"] as const,
    lists: () => [...CategoryKeys.all, "list"] as const,
    list: (page: number, search: string) =>
        [...CategoryKeys.lists(), page, search] as const,
}

// CREATE category
export const useCreateCategory = () => {
    return useMutation({
        mutationFn: async (values: CreateCategory) => {
            return await createCategory(values)
        },
        onSuccess(data) {
            const message = data.message || "Category created successfully."
            toast.success(message)
        },
        onError() {
            toast.error("Failed to create category!")
        }
    })
}

// GET categories
export const useCategories = ({ page = 1, search = "" }: { page: number, search: string }) => {
    return useQuery({
        queryKey: CategoryKeys.list(page, search),
        queryFn: async () => {
            return await getCategories({ page, search })
        }
    })
}

// UPDATE a category
export const useUpdateCategory = () => {

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ values, categoryId }: { values: UpdateCategory, categoryId: string }) => {
            return await updateCategory(values, categoryId)

        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({
                queryKey: CategoryKeys.lists()
            })

            const message = data.message || "Category updated successfully."
            toast.success(message)
        },
        onError: () => {
            toast.error("Failed to update category")
        }

    })
}

//  Archive a category
export const useArchiveCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryId: string) => {
            return archiveCategory(categoryId);
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: CategoryKeys.lists() });
            const message = data.message || "Category archived successfully"
            toast.success(message);
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "Failed to archive category";
            toast.error(message);
        },
    });
};

// Restore a category
export const useRestoreCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryId: string) => {
            return restoreCategory(categoryId);
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: CategoryKeys.lists() });

            const message = data.message || "Category restored successfully"
            toast.success(message);
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "Failed to restore category";
            toast.error(message);
        },
    });
};