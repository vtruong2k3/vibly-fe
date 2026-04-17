// ─── API Base ────────────────────────────────────────────────────────────────
export const API_BASE_URL = "/api/v1";

// Google OAuth requires a full absolute URL (browser redirect, not Axios proxy)
export const GOOGLE_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

// ─── API Endpoints ────────────────────────────────────────────────────────────
// Single source of truth for ALL backend routes.
// Pattern: ENDPOINTS.<domain>.<action>
export const ENDPOINTS = {
  // ── Auth ─────────────────────────────────────────────────────────────────
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    logoutAll: "/auth/logout-all",
    verifyEmail: "/auth/verify-email",
    resendVerifyEmail: "/auth/resend-verify-email",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  users: {
    me: "/users/me",
    updateMe: "/users/me",
    updateProfile: "/users/me/profile",
    sessions: "/users/me/sessions",
    search: "/users/search",
    byId: (id: string) => `/users/${id}`,
    posts: (id: string) => `/users/${id}/posts`,
  },

  // ── Friendships ───────────────────────────────────────────────────────────
  friends: {
    list: "/friends",
    requests: "/friends/requests",
    status: (targetId: string) => `/friends/status/${targetId}`,
    sendRequest: "/friends/request",
    accept: (requestId: string) => `/friends/${requestId}/accept`,
    reject: (requestId: string) => `/friends/${requestId}/reject`,
    cancel: (requestId: string) => `/friends/requests/${requestId}`,
    remove: (userId: string) => `/friends/${userId}`,
  },

  // ── Blocks ────────────────────────────────────────────────────────────────
  blocks: {
    block: (userId: string) => `/blocks/${userId}`,
    unblock: (userId: string) => `/blocks/${userId}`,
  },

  // ── Posts ─────────────────────────────────────────────────────────────────
  posts: {
    create: "/posts",
    byId: (id: string) => `/posts/${id}`,
    update: (id: string) => `/posts/${id}`,
    delete: (id: string) => `/posts/${id}`,
    react: (id: string) => `/posts/${id}/reactions`,
    removeReaction: (id: string) => `/posts/${id}/reactions`,
    addComment: (id: string) => `/posts/${id}/comments`,
    getComments: (id: string) => `/posts/${id}/comments`,
    save: (id: string) => `/posts/${id}/save`,
    unsave: (id: string) => `/posts/${id}/save`,
  },

  // ── Comments ──────────────────────────────────────────────────────────────
  comments: {
    update: (id: string) => `/comments/${id}`,
    delete: (id: string) => `/comments/${id}`,
  },

  // ── Feed ──────────────────────────────────────────────────────────────────
  feed: {
    getFeed: "/feed",
    getSaved: "/feed/saved",
  },

  // ── Media ─────────────────────────────────────────────────────────────────
  media: {
    presignedUrl: "/media/presigned-url",
    confirm: (id: string) => `/media/${id}/confirm`,
    byId: (id: string) => `/media/${id}`,
    delete: (id: string) => `/media/${id}`,
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: {
    getAll: "/settings",
    updatePrivacy: "/settings/privacy",
    updateNotifications: "/settings/notifications",
  },

  // ── Presence ──────────────────────────────────────────────────────────────
  presence: {
    statuses: "/presence/status",
  },

  // ── Conversations ─────────────────────────────────────────────────────────
  conversations: {
    create: "/conversations",
    list: "/conversations",
    markRead: (id: string) => `/conversations/${id}/read`,
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: {
    list: (conversationId: string) => `/conversations/${conversationId}/messages`,
    send: (conversationId: string) => `/conversations/${conversationId}/messages`,
    edit: (id: string) => `/messages/${id}`,
    delete: (id: string) => `/messages/${id}`,
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    list: "/notifications",
    markAllRead: "/notifications/read-all",
    markRead: (id: string) => `/notifications/${id}/read`,
  },

  // ── Calls ─────────────────────────────────────────────────────────────────
  calls: {
    start: "/calls/start",
    token: (id: string) => `/calls/${id}/token`,
    accept: (id: string) => `/calls/${id}/accept`,
    reject: (id: string) => `/calls/${id}/reject`,
    end: (id: string) => `/calls/${id}/end`,
    session: (id: string) => `/calls/${id}`,
    iceServers: "/calls/config/ice-servers",
  },

  // ── Moderation ────────────────────────────────────────────────────────────
  moderation: {
    report: "/moderation/report",
    reports: "/moderation/reports",
    action: "/moderation/action",
  },
} as const;

// ─── React Query Keys ─────────────────────────────────────────────────────────
// Centralised cache keys to avoid typos and enable targeted invalidation.
export const QUERY_KEYS = {
  me: ["me"] as const,
  feed: ["feed"] as const,
  feedSaved: ["feed", "saved"] as const,
  post: (id: string) => ["post", id] as const,
  userPosts: (id: string) => ["user-posts", id] as const,
  userProfile: (id: string) => ["user-profile", id] as const,
  friends: ["friends"] as const,
  friendRequests: ["friend-requests"] as const,
  conversations: ["conversations"] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
  notifications: ["notifications"] as const,
  settings: ["settings"] as const,
  presenceStatuses: (ids: string[]) => ["presence", ids.join(",")] as const,
  postComments: (postId: string) => ["comments", postId] as const,
} as const;
