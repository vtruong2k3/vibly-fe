import { MOCK_USERS, MOCK_CURRENT_USER } from "./feed";
import type { PostComment } from "@/types";

// ─── Mock Comments ─────────────────────────────────────────────────
// Indexed by postId — keyed to first post "p1" for visual testing.

export const MOCK_COMMENTS_P1: PostComment[] = [
  {
    id: "c1",
    postId: "p1",
    author: MOCK_USERS[0], // Alex
    content: "This is such a great perspective! Really enjoyed reading this.",
    replyCount: 2,
    likeCount: 14,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "c2",
    postId: "p1",
    author: MOCK_USERS[2], // Sophia
    content: "Totally agree — the second point really resonated with me 👏",
    replyCount: 0,
    likeCount: 7,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "c3",
    postId: "p1",
    author: MOCK_CURRENT_USER,
    content: "Thanks everyone for the kind words! More coming soon 🙌",
    replyCount: 1,
    likeCount: 3,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

// Helper: Get comments for a specific postId
export const getMockComments = (postId: string): PostComment[] => {
  if (postId === "p1") return MOCK_COMMENTS_P1;
  return [];
};
