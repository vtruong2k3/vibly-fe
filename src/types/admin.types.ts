// ─── Admin Actor ──────────────────────────────────────────────────────────────
export type AdminRole = "ADMIN" | "MODERATOR";

export interface AdminUser {
  id: string;
  email: string;
  username?: string;
  role: AdminRole;
}

// ─── Cursor Pagination (BE uses cursor-based, not page-based) ────────────────
export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
  };
}

/** @deprecated Use CursorPaginatedResponse — BE returns cursor pagination, not offset */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

// ─── User Management ──────────────────────────────────────────────────────────
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
export type UserRole = "USER" | "MODERATOR" | "ADMIN";

/** Shape returned by GET /admin/users (list item) */
export interface AdminUserListItem {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  verifiedAt: string | null;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  _count: {
    posts: number;
    reportsFiled: number;
  };
}

/** Shape returned by GET /admin/users/:id (detail) */
export interface AdminUserDetail extends Omit<AdminUserListItem, "_count"> {
  totpEnabled: boolean;
  _count: {
    posts: number;
    comments: number;
    reportsFiled: number;
  };
  moderationHistory: AuditLogEntry[];
}

export type BulkUserAction = "SUSPEND" | "ACTIVATE" | "BAN";

export interface BulkActionDto {
  userIds: string[];
  action: BulkUserAction;
  reason: string;
}

// ─── KYC Verification ────────────────────────────────────────────────────────
export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";

export interface KycRequest {
  id: string;
  status: VerificationStatus;
  idType: string;
  legalName: string;
  frontDocUrl: string;
  backDocUrl?: string | null;
  selfieUrl: string;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  submittedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
  };
  reviewer?: {
    username: string;
    role: string;
  } | null;
}

// ─── Posts ────────────────────────────────────────────────────────────────────
export type PostStatus = "PUBLISHED" | "HIDDEN" | "DELETED";
export type MediaStorageStatus = "ACTIVE" | "QUARANTINED" | "PURGED";

export interface AdminPostListItem {
  id: string;
  content: string;
  status: PostStatus;
  visibility: string;
  createdAt: string;
  deletedAt: string | null;
  author: { id: string; username: string; status: UserStatus };
  _count: { reactions: number; comments: number; media: number };
}

export interface MediaAsset {
  id: string;
  mimeType: string;
  mediaType: string;
  storageStatus: MediaStorageStatus;
  quarantinedAt: string | null;
  purgeScheduledAt: string | null;
}

export interface AdminPostDetail extends AdminPostListItem {
  media: Array<{ mediaAsset: MediaAsset }>;
  openReports: Array<{
    id: string;
    reasonCode: string;
    severity: ReportSeverity;
    createdAt: string;
    reporter: { id: string; username: string };
  }>;
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export type CommentStatus = "ACTIVE" | "DELETED";

export interface AdminCommentListItem {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  deletedAt: string | null;
  author: { id: string; username: string };
  post: { id: string; content: string };
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export type ReportStatus = "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";
export type ReportTargetType = "POST" | "COMMENT" | "USER";
export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AdminReportListItem {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reasonCode: string;
  reasonNote?: string;
  severity: ReportSeverity;
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string;
  reporter?: { id: string; username: string; avatar?: string };
  assignedTo?: { id: string; username: string; avatar?: string } | null;
  targetUser?: { id: string; username: string; avatar?: string };
  targetPost?: { id: string; content?: string; author?: { id: string; username: string; avatar?: string } };
  targetComment?: { id: string; content?: string; author?: { id: string; username: string; avatar?: string } };
}

// ─── Moderation Settings ──────────────────────────────────────────────────────
export interface AdminKeywordListItem {
  id: string;
  keyword: string;
  severity: ReportSeverity;
  createdAt: string;
  creator: { id: string; username: string };
}

export interface SystemSetting {
  key: string;
  value: string;
  type: string;
  description: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

// ─── Analytics (BE exact response shapes) ────────────────────────────────────

/** Raw shape from GET /admin/analytics/overview */
export interface BeAnalyticsOverview {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    newToday: number;
    deltaNewUsers: number;
  };
  content: {
    postsToday: number;
    commentsToday: number;
    deltaPosts: number;
    deltaComments: number;
  };
  reports: {
    pending: number;
    critical: number;
  };
}

/** Normalised shape for UI consumption */
export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  deltaNewUsers: number;
  totalPostsToday: number;
  commentsToday: number;
  deltaPosts: number;
  deltaComments: number;
  reportsPending: number;
  reportsCritical: number;
}

/** Mapper: converts raw BE response to normalised UI shape */
export function mapAnalyticsOverview(be: BeAnalyticsOverview): AnalyticsOverview {
  return {
    totalUsers: be.users.total,
    activeUsers: be.users.active,
    suspendedUsers: be.users.suspended,
    bannedUsers: be.users.banned,
    newUsersToday: be.users.newToday,
    deltaNewUsers: be.users.deltaNewUsers,
    totalPostsToday: be.content.postsToday,
    commentsToday: be.content.commentsToday,
    deltaPosts: be.content.deltaPosts,
    deltaComments: be.content.deltaComments,
    reportsPending: be.reports.pending,
    reportsCritical: be.reports.critical,
  };
}

export interface AnalyticsTrend {
  date: string;
  count: number;
}

export interface AnalyticsContentTrend {
  posts: AnalyticsTrend[];
  comments: AnalyticsTrend[];
}

export interface AnalyticsReportBreakdown {
  reasonCode: string;
  status: ReportStatus;
  count: number;
}

// ─── Admin Accounts (Admin/Mod management) ───────────────────────────────────
export interface AdminAccountListItem {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  totpEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminAccountDetail extends AdminAccountListItem {
  totpVerifiedAt: string | null;
  recentActions: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    reason: string | null;
    createdAt: string;
  }>;
}

export interface AdminAccountStats {
  totalAdmins: number;
  totalMods: number;
  totalWithTotp: number;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  payload?: Record<string, unknown>;
  ip: string | null;
  reason: string | null;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

// ─── TOTP Auth ────────────────────────────────────────────────────────────────

/** Response from POST /admin/auth/totp/setup */
export interface TotpSetupResponse {
  otpauthUrl: string;
  qrDataUrl: string;
}

/** Response from POST /admin/auth/totp/enable */
export interface TotpEnableResponse {
  backupCodes: string[];
}
