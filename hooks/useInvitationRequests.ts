"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getInvitationRequests,
    createInvitationRequest,
} from "@/lib/actions/invitation-request"
import { toast } from "sonner";
import type { InvitationRequestInput } from "@/lib/schemas/invitation-request";

interface GetRequestsParams {
    page: number;
    search: string;
    email: string
}

const RequestKeys = {
    all: ["invitation-requests"] as const,
    lists: () => [...RequestKeys.all, "list"] as const,
    list: (page: number, search: string) =>
        [...RequestKeys.lists(), page, search] as const,
};

// Query hook
export const useInvitationRequests = ({ page, search, email }: GetRequestsParams) => {
    return useQuery({
        queryKey: RequestKeys.list(page, search),
        queryFn: () => getInvitationRequests({ page, search, email }),
    });
};

// Create request mutation
export const useCreateInvitationRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ data, requestorId }: { data: InvitationRequestInput; requestorId: string }) => {
            const result = await createInvitationRequest(data, requestorId);

            if (!result.success) {
                throw new Error(result.message);
            }

            return result;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: RequestKeys.lists() });
            toast.success(data.message);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};

