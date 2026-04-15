import { create } from "zustand";

// ─── Notification Types ───────────────────────────────────────────────────────
export type NotificationType =
  | "friend_request_received"
  | "friend_request_accepted"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  // friend_request_received
  sender?: {
    id: string;
    username: string;
    displayName?: string;
    avatarMediaId?: string | null;
  };
  requestId?: string;
  // friend_request_accepted
  acceptedBy?: { id: string } ;
  message?: string;
}

// ─── Notification Store ───────────────────────────────────────────────────────
interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  push: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  push: (n) =>
    set((s) => {
      const newN: AppNotification = {
        ...n,
        id: crypto.randomUUID(),
        read: false,
        createdAt: new Date().toISOString(),
      };
      return {
        notifications: [newN, ...s.notifications].slice(0, 50),
        unreadCount: s.unreadCount + 1,
      };
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
