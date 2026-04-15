import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";
import type { CursorPaginationParams } from "./posts.service";

// ─── Notifications Service ────────────────────────────────────────────────────
export const notificationsService = {
  list: (params: CursorPaginationParams) =>
    apiClient.get(ENDPOINTS.notifications.list, { params }).then((r) => r.data),

  markAllRead: () =>
    apiClient.patch(ENDPOINTS.notifications.markAllRead).then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch(ENDPOINTS.notifications.markRead(id)).then((r) => r.data),
};
