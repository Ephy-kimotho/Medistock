"use client"

import { useQuery } from "@tanstack/react-query";
import { getApplicationUsers } from "@/lib/actions/users"

const Userkeys = {
    all: ["all", "users"] as const
}


export const useUsers = () => {
    return useQuery({
        queryKey: Userkeys.all,
        queryFn: async () => {
            return getApplicationUsers()
        },
    })
}
