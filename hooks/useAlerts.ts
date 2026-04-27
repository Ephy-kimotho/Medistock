import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAlerts,
  getAlertCounts,
  getPendingAlertCount,
  markAlertAsRead,
  resolveAlert,
  markAllAlertsAsRead,
} from "@/lib/actions/alerts";
import type { AlertFilters } from "@/lib/types";

// Query keys
const ALERTS_KEY = "alerts";
const ALERT_COUNTS_KEY = "alert-counts";
const PENDING_COUNT_KEY = "pending-alert-count";

export function useAlerts(filters: AlertFilters = {}) {
  return useQuery({
    queryKey: [ALERTS_KEY, filters],
    queryFn: async () => {
      const result = await getAlerts(filters);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });
}

export function useAlertCounts() {
  return useQuery({
    queryKey: [ALERT_COUNTS_KEY],
    queryFn: async () => {
      const result = await getAlertCounts();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });
}

export function usePendingAlertCount() {
  return useQuery({
    queryKey: [PENDING_COUNT_KEY],
    queryFn: async () => {
      const result = await getPendingAlertCount();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAlertAsRead,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Alert marked as read");
        queryClient.invalidateQueries({ queryKey: [ALERTS_KEY] });
        queryClient.invalidateQueries({ queryKey: [ALERT_COUNTS_KEY] });
        queryClient.invalidateQueries({ queryKey: [PENDING_COUNT_KEY] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark alert as read");
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, userId }: { alertId: string; userId: string }) =>
      resolveAlert(alertId, userId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Alert resolved");
        queryClient.invalidateQueries({ queryKey: [ALERTS_KEY] });
        queryClient.invalidateQueries({ queryKey: [ALERT_COUNTS_KEY] });
        queryClient.invalidateQueries({ queryKey: [PENDING_COUNT_KEY] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resolve alert");
    },
  });
}

export function useMarkAllAlertsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAlertsAsRead,
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success(`Marked ${result.data.count} alerts as read`);
        queryClient.invalidateQueries({ queryKey: [ALERTS_KEY] });
        queryClient.invalidateQueries({ queryKey: [ALERT_COUNTS_KEY] });
        queryClient.invalidateQueries({ queryKey: [PENDING_COUNT_KEY] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark all alerts as read");
    },
  });
}