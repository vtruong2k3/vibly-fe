"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  settingsService,
  type UpdatePrivacySettingsDto,
  type UpdateNotificationSettingsDto,
} from "@/lib/services/settings.service";
import { QUERY_KEYS } from "@/lib/api/constants";

// ─── useSettings ──────────────────────────────────────────────────────────────
export function useSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.settings,
    queryFn: () => settingsService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── useUpdatePrivacySettings ─────────────────────────────────────────────────
export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePrivacySettingsDto) => settingsService.updatePrivacy(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings });
      toast.success("Privacy settings updated.");
    },
    onError: () => toast.error("Failed to save privacy settings."),
  });
}

// ─── useUpdateNotificationSettings ───────────────────────────────────────────
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateNotificationSettingsDto) =>
      settingsService.updateNotifications(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings });
      toast.success("Notification preferences saved.");
    },
    onError: () => toast.error("Failed to save notification settings."),
  });
}
