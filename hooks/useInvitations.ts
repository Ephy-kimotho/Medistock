"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { getInvitations, resendInvite } from "@/lib/actions/invitations"
import { toast } from "sonner"

const InvitationKeys = {
    all: ["invitations", "all"] as const
}

export const useInvitations = () => {
    return useQuery({
        queryKey: InvitationKeys.all,
        queryFn: async () => {
            return await getInvitations()
        }
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