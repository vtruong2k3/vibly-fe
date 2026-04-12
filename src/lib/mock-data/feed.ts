import type { Post, User } from "@/types";

// ─── Mock Users ─────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: "u1",
    username: "arivers",
    displayName: "Alex Rivers",
    avatarUrl: "https://i.pravatar.cc/150?u=arivers",
    bio: "Building the future, one commit at a time.",
    isOnline: true,
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "u2",
    username: "minh_nguyen",
    displayName: "Minh Nguyễn",
    avatarUrl: "https://i.pravatar.cc/150?u=minh_nguyen",
    bio: "Design thinker. Coffee lover.",
    isOnline: false,
    createdAt: "2025-02-20T08:30:00Z",
  },
  {
    id: "u3",
    username: "sophialee",
    displayName: "Sophia Lee",
    avatarUrl: "https://i.pravatar.cc/150?u=sophialee",
    bio: "Photographer | Traveler | Storyteller",
    isOnline: true,
    createdAt: "2025-03-01T12:00:00Z",
  },
  {
    id: "u4",
    username: "davidpark",
    displayName: "David Park",
    avatarUrl: "https://i.pravatar.cc/150?u=davidpark",
    bio: "Backend engineer turned indie hacker.",
    isOnline: false,
    createdAt: "2025-03-10T09:00:00Z",
  },
];

// ─── Current Logged-in User (Mock) ──────────────────────────────
export const MOCK_CURRENT_USER: User = {
  id: "me",
  username: "vibly_user",
  displayName: "You",
  avatarUrl: "https://i.pravatar.cc/150?u=vibly_user",
  bio: "Living on Vibly.",
  isOnline: true,
  createdAt: "2025-01-01T00:00:00Z",
};

// ─── Mock Posts ─────────────────────────────────────────────────
export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    author: MOCK_USERS[0],
    content:
      "Just shipped a new feature for Vibly! The feed is now blazing fast with React Query infinite scroll. The developer experience is insane. 🚀",
    images: [
      {
        url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
        altText: "Code on a screen",
        width: 800,
        height: 534,
      },
    ],
    likeCount: 142,
    commentCount: 28,
    shareCount: 12,
    isLiked: false,
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 min ago
  },
  {
    id: "p2",
    author: MOCK_USERS[2],
    content:
      "Golden hour in Da Nang. Nothing beats this light. 📷✨ No filter, just the moment.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        altText: "Beautiful golden hour at the beach",
        width: 800,
        height: 534,
      },
      {
        url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
        altText: "Panoramic mountain and ocean view",
        width: 800,
        height: 534,
      },
    ],
    likeCount: 389,
    commentCount: 47,
    shareCount: 33,
    isLiked: true,
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hrs ago
  },
  {
    id: "p3",
    author: MOCK_USERS[1],
    content:
      "Hot take: Dark mode isn't just aesthetic. It genuinely reduces cognitive load during long design sessions. Change my mind.",
    images: [],
    likeCount: 201,
    commentCount: 65,
    shareCount: 18,
    isLiked: false,
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hrs ago
  },
  {
    id: "p4",
    author: MOCK_USERS[3],
    content:
      "Started building my side project last month. Zero users. Zero revenue. But I've never felt more alive coding something for myself.",
    images: [],
    likeCount: 512,
    commentCount: 91,
    shareCount: 54,
    isLiked: true,
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "p5",
    author: MOCK_USERS[0],
    content:
      "Reading about the new Next.js 15 features. The App Router just keeps getting better. Server Actions + React Query is an unbeatable combo.",
    images: [],
    likeCount: 98,
    commentCount: 14,
    shareCount: 7,
    isLiked: false,
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hrs ago
  },
];
