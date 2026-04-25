// ─── Admin API Endpoints ─────────────────────────────────────────────────────
// All admin routes are namespaced under /admin/* to keep them isolated
// from the public user-facing API surface.
// Source of truth: http://localhost:8000/api/docs
export const ADMIN_ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    login: "/admin/auth/login",
    refresh: "/admin/auth/refresh",
    logout: "/admin/auth/logout",
    // TOTP Login step 2
    totpVerify: "/admin/auth/totp/verify",
    // TOTP Setup (requires authenticated admin)
    totpSetup: "/admin/auth/totp/setup",
    totpEnable: "/admin/auth/totp/enable",
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  users: {
    list: "/admin/users",
    byId: (id: string) => `/admin/users/${id}`,
    updateStatus: (id: string) => `/admin/users/${id}/status`,
    updateRole: (id: string) => `/admin/users/${id}/role`,
    bulkAction: "/admin/users/bulk-action",
  },

  // ── Content → Posts ───────────────────────────────────────────────────────
  posts: {
    list: "/admin/content/posts",
    byId: (id: string) => `/admin/content/posts/${id}`,
    remove: (id: string) => `/admin/content/posts/${id}/remove`,
    restore: (id: string) => `/admin/content/posts/${id}/restore`,
  },

  // ── Content → Comments ────────────────────────────────────────────────────
  comments: {
    list: "/admin/content/comments",
    remove: (id: string) => `/admin/content/comments/${id}/remove`,
  },

  // ── Reports ───────────────────────────────────────────────────────────────
  reports: {
    list: "/admin/reports",
    byId: (id: string) => `/admin/reports/${id}`,
    reviewing: (id: string) => `/admin/reports/${id}/reviewing`,
    resolve: (id: string) => `/admin/reports/${id}/resolve`,
    dismiss: (id: string) => `/admin/reports/${id}/dismiss`,
    escalate: (id: string) => `/admin/reports/${id}/escalate`,
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  analytics: {
    overview: "/admin/analytics/overview",
    registrations: "/admin/analytics/registrations",
    content: "/admin/analytics/content",
    reportsBreakdown: "/admin/analytics/reports/breakdown",
  },

  // ── Accounts (Admin/Mod management — ADMIN only) ──────────────────────────
  accounts: {
    list: "/admin/accounts",
    stats: "/admin/accounts/stats",
    byId: (id: string) => `/admin/accounts/${id}`,
    updateRole: (id: string) => `/admin/accounts/${id}/role`,
    updateStatus: (id: string) => `/admin/accounts/${id}/status`,
  },

  // ── Audit Logs (ADMIN only) ───────────────────────────────────────────────
  auditLogs: {
    list: "/admin/audit-logs",
  },

  // ── Moderation Settings (Auto-Moderation) ─────────────────────────────────
  moderation: {
    base: "/admin/moderation",
    keywords: "/admin/moderation/keywords",
    removeKeyword: (id: string) => `/admin/moderation/keywords/${id}`,
  },
  settings: {
    base: "/admin/settings",
  },

  // ── KYC / Verification ────────────────────────────────────────────────────
  kyc: {
    list: "/admin/kyc",
    byId: (id: string) => `/admin/kyc/${id}`,
    review: (id: string) => `/admin/kyc/${id}/review`,
    toggleBadge: (userId: string) => `/admin/kyc/users/${userId}/badge`,
  },
} as const;

// ─── Admin React Query Keys ───────────────────────────────────────────────────
export const ADMIN_QUERY_KEYS = {
  // Users
  users: ["admin", "users"] as const,
  user: (id: string) => ["admin", "user", id] as const,

  // Content
  posts: ["admin", "posts"] as const,
  post: (id: string) => ["admin", "post", id] as const,
  comments: ["admin", "comments"] as const,

  // Reports
  reports: ["admin", "reports"] as const,
  reportsPending: ["admin", "reports", "pending"] as const,
  report: (id: string) => ["admin", "report", id] as const,
  settings: ["admin", "settings"] as const,

  // Analytics
  analyticsOverview: ["admin", "analytics", "overview"] as const,
  analyticsRegistrations: ["admin", "analytics", "registrations"] as const,
  analyticsContent: ["admin", "analytics", "content"] as const,
  analyticsReports: ["admin", "analytics", "reports-breakdown"] as const,

  // Accounts (Admin/Mod management)
  accounts: ["admin", "accounts"] as const,
  accountStats: ["admin", "accounts", "stats"] as const,
  account: (id: string) => ["admin", "account", id] as const,

  // Audit Logs
  auditLogs: ["admin", "audit-logs"] as const,

  // Moderation
  moderationKeywords: ["admin", "moderation", "keywords"] as const,

  // KYC / Verification
  kyc: ["admin", "kyc"] as const,
  kycRequest: (id: string) => ["admin", "kyc", id] as const,
} as const;
