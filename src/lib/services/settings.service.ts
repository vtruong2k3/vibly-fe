import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export type PrivacyVisibility = "EVERYONE" | "FRIENDS" | "ONLY_ME";
export type AllowFrom = "EVERYONE" | "FRIENDS" | "NO_ONE";

export interface UpdatePrivacySettingsDto {
  profileVisibility?: PrivacyVisibility;
  friendListVisibility?: PrivacyVisibility;
  allowFriendRequestsFrom?: AllowFrom;
  allowMessagesFrom?: AllowFrom;
  allowCallsFrom?: AllowFrom;
  showOnlineStatus?: boolean;
  showLastSeen?: boolean;
}

export interface UpdateNotificationSettingsDto {
  likeEnabled?: boolean;
  commentEnabled?: boolean;
  friendRequestEnabled?: boolean;
  messageEnabled?: boolean;
  callEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
}

// ─── Settings Service ─────────────────────────────────────────────────────────
export const settingsService = {
  getAll: () =>
    apiClient.get(ENDPOINTS.settings.getAll).then((r) => r.data),

  updatePrivacy: (dto: UpdatePrivacySettingsDto) =>
    apiClient.patch(ENDPOINTS.settings.updatePrivacy, dto).then((r) => r.data),

  updateNotifications: (dto: UpdateNotificationSettingsDto) =>
    apiClient
      .patch(ENDPOINTS.settings.updateNotifications, dto)
      .then((r) => r.data),
};
