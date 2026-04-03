"use client";

import { useQuery } from "@tanstack/react-query";
import { getNextEmployeeId } from "@/lib/actions/employee-id";

export const useNextEmployeeId = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["next-employee-id"],
    queryFn: () => getNextEmployeeId(),
    enabled,
    staleTime: 0, 
    refetchOnWindowFocus: false,
  });
};