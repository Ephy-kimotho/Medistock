"use client";

import { useQuery } from "@tanstack/react-query";
import {
    getTransactions,
    getTransactionStats,
    getTransactionUsers,
    getTransactionMedicines,
} from "@/lib/actions/transactions";
import type { TransactionFilters } from "@/lib/types";

export const TransactionKeys = {
    all: ["transactions"] as const,
    lists: () => [...TransactionKeys.all, "list"] as const,
    list: (filters: TransactionFilters) =>
        [...TransactionKeys.lists(), filters] as const,
    stats: (userId?: string) =>
        [...TransactionKeys.all, "stats", userId] as const,
    users: () => [...TransactionKeys.all, "users"] as const,
    medicines: () => [...TransactionKeys.all, "medicines"] as const,
};

// GET transactions for table display
export const useTransactions = (filters: TransactionFilters) => {
    return useQuery({
        queryKey: TransactionKeys.list(filters),
        queryFn: () => getTransactions(filters),
    });
};

// GET transactions stats for display
export const useTransactionStats = (userId?: string) => {
    return useQuery({
        queryKey: TransactionKeys.stats(userId),
        queryFn: () => getTransactionStats(userId),
    });
};

// Get the users for the user filter
export const useTransactionUsers = () => {
    return useQuery({
        queryKey: TransactionKeys.users(),
        queryFn: () => getTransactionUsers(),
    });
};

// Get the medicines for the  edicine filter
export const useTransactionMedicines = () => {
    return useQuery({
        queryKey: TransactionKeys.medicines(),
        queryFn: () => getTransactionMedicines(),
    });
};