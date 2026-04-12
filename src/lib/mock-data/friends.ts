import { MOCK_USERS, MOCK_CURRENT_USER } from "./feed";
import type { FriendRequest, User } from "@/types";

// ─── Friend Requests ──────────────────────────────────────────────
export const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: "req_1",
    sender: {
      id: "u5",
      username: "emily_c",
      displayName: "Emily Chen",
      avatarUrl: "https://i.pravatar.cc/150?u=emily_c",
      bio: "Product Designer @ TechCorp",
      isOnline: true,
      createdAt: "2025-01-10T00:00:00Z",
    },
    receiverId: MOCK_CURRENT_USER.id,
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "req_2",
    sender: {
      id: "u6",
      username: "josh_dev",
      displayName: "Josh Miller",
      avatarUrl: "https://i.pravatar.cc/150?u=josh_dev",
      bio: "Fullstack Developer. Open source enthusiast.",
      isOnline: false,
      createdAt: "2025-02-15T00:00:00Z",
    },
    receiverId: MOCK_CURRENT_USER.id,
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

// ─── Friend Suggestions ───────────────────────────────────────────
export const MOCK_SUGGESTIONS: User[] = [
  {
    id: "u7",
    username: "sarah_k",
    displayName: "Sarah Kim",
    avatarUrl: "https://i.pravatar.cc/150?u=sarah_k",
    bio: "UX Researcher. Coffee addict.",
    isOnline: false,
    createdAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "u8",
    username: "marcus_w",
    displayName: "Marcus Wright",
    avatarUrl: "https://i.pravatar.cc/150?u=marcus_w",
    bio: "Building cool things.",
    isOnline: true,
    createdAt: "2025-03-20T00:00:00Z",
  },
  {
    ...MOCK_USERS[1], // Minh
  },
];

// ─── Current Friends ──────────────────────────────────────────────
export const MOCK_FRIENDS: User[] = [
  MOCK_USERS[0], // Alex
  MOCK_USERS[2], // Sophia
  MOCK_USERS[3], // David
];
