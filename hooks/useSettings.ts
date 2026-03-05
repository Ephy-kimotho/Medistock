"use client"

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { getApplicationSettings, setApplicationSettings } from "@/lib/actions/settings"
import type { Settings } from "@/lib/schemas/settings";
import { toast } from "sonner"

export const SettingsKeys = {
    all: ["application", "settings"] as const
}


export const useSettings = () => {
    return useQuery(({
        queryKey: SettingsKeys.all,
        queryFn: async () => {
            return getApplicationSettings()
        },
        staleTime: 10 * 60 * 1000
    }))
}

export const prefetchSettings = async (queryClient: ReturnType<typeof useQueryClient>,) => {
    await queryClient.prefetchQuery({
        queryKey: SettingsKeys.all,
        queryFn: async () => {
            return getApplicationSettings()
        }
    })

}


export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings: Settings) => {
            return setApplicationSettings({ values: settings });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SettingsKeys.all });
            toast.success("Settings saved successfully");
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "Failed to save settings";
            toast.error(message);
        },
    });
};
