"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsService } from "@/lib/services/notifications.service";
import { QUERY_KEYS } from "@/lib/api/constants";

// ─── useNotificationsQuery ────────────────────────────────────────────────────
export function useNotificationsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: () => notificationsService.list({ limit: 20 }),
    refetchInterval: 30_000, // poll every 30s until WebSocket is set up
  });
}

// ─── useMarkAllRead ───────────────────────────────────────────────────────────
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications }),
    onError: () => toast.error("Failed to mark notifications as read."),
  });
}

// ─── useMarkRead ──────────────────────────────────────────────────────────────
export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications }),
  });
}
