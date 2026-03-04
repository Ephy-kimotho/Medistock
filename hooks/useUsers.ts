"use client"

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { getApplicationUsers } from "@/lib/actions/users"
import { updateUserRole } from "@/lib/actions/users"
import { toast } from "sonner"
import { banUser, unbanUser } from "@/lib/auth-client"
import type { GetUsersProps, Role, BanUserInfo } from "@/lib/types"

const UserKeys = {
    all: ["users"] as const,
    lists: () => [...UserKeys.all, "list"] as const,
    list: (page: number, role: string, search: string) =>
        [...UserKeys.lists(), page, role, search] as const,
}

// Get users hooks
export const useUsers = ({ page, role, search }: GetUsersProps) => {
    return useQuery({
        queryKey: UserKeys.list(page, role, search),
        queryFn: async () => {
            return getApplicationUsers({
                page, role, search: search.trim()
            })
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    })
}

// Change User role
export const useSetUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            role,
        }: {
            userId: string;
            role: Role;
        }) => {
            console.log(userId, role)
            const result = await updateUserRole({ userId, role });
            return result;
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: UserKeys.lists() });
            const message = data.message || "User role updated successfully"
            toast.success(message);
        },
        onError: (error) => {
            toast.error("Failed to update user role");
            console.error("Error updating user role:", error);
        },
    });
};

// Ban user hook
export const useBanUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, banReason = "", banExpiresIn }: BanUserInfo) => {
            const result = await banUser({
                userId,
                banReason,
                banExpiresIn
            });
            return result;
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: UserKeys.lists() });

            const message = `${data.data?.user.name || "User"} banned  successfully` || "User banned  successfully"

            toast.success(message);
        },
        onError: (error) => {
            toast.error("Failed to ban user");
            console.error("Error banning user:", error);
        },
    })

}

// Unban user hook
export const useUnBanUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId: string) => {
            const result = await unbanUser({
                userId
            })
            return result;
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: UserKeys.lists() });

            const message = `${data.data?.user.name || "User"} unbanned  successfully` || "User unbanned  successfully"
            toast.success(message);
        },
        onError: (error) => {
            toast.error("Failed to unban user");
            console.error("Error banning user:", error);
        },
    })
}