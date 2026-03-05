"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { getInvitations, resendInvite } from "@/lib/actions/invitations"
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


export const useResendInvite = () => {
    return useMutation({
        mutationFn: async (token: string) => {
            return resendInvite(token)
        },
        onSuccess(data) {
            const message = `Invite resent to ${data.invitation.email}`
            toast.success(message)
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