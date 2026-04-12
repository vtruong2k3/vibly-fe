import { MOCK_USERS, MOCK_CURRENT_USER } from "./feed";
import type { AppNotification } from "@/types";

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_1",
    recipientId: MOCK_CURRENT_USER.id,
    actor: MOCK_USERS[0], // Alex
    type: "like_post",
    entityId: "p1",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: "notif_2",
    recipientId: MOCK_CURRENT_USER.id,
    actor: MOCK_USERS[2], // Sophia
    type: "comment_post",
    entityId: "p2",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: "notif_3",
    recipientId: MOCK_CURRENT_USER.id,
    actor: MOCK_USERS[1], // Minh
    type: "mention",
    entityId: "p3",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "notif_4",
    recipientId: MOCK_CURRENT_USER.id,
    actor: MOCK_USERS[3], // David
    type: "friend_accept",
    entityId: "friend_4",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];
