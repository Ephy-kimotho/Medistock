"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getInvitations, resendInvite, createInvitation } from "@/lib/actions/invitations"
import { toast } from "sonner"
import type { GetInvitationProps } from "@/lib/types"

const InvitationKeys = {
    all: ["invitations"] as const,
    lists: () => [...InvitationKeys.all, "list"] as const,
    list: (page: number, role: string, search: string) =>
        [...InvitationKeys.lists(), page, role, search] as const,
}

export const useInvitations = ({ page, role, search }: GetInvitationProps) => {
    return useQuery({
        queryKey: InvitationKeys.list(page, role, search),
        queryFn: async () => {
            return await getInvitations({
                page,
                role,
                search: search.trim()
            })
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    })

}

export const useSendInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ requestId, invitorId }: { requestId: string, invitorId: string }) => {
            const result = await createInvitation(requestId, invitorId)
            return result
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["invitation-requests", "list"] });
            toast.success(data.message);
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "Failed to send invitation";
            toast.error(message);
        },
    });
};

export const useResendInvite = () => {
    return useMutation({
        mutationFn: async (token: string) => {
            return resendInvite(token)
        },
        onSuccess(data) {
            toast.success(data.message)
        },
        onError(error) {
            let message = "Failed to resend invite user"

            if (error instanceof Error) {
                message = error.message
            }

            toast.error(message)
        },
    })
}