// ─── Core Domain Types ──────────────────────────────────────────
// These are domain-level types used across the application.
// Generated types (from backend OpenAPI) live in api.generated.ts

// ─── User ───────────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isOnline: boolean;
  createdAt: string; // ISO 8601
}

// ─── Post ───────────────────────────────────────────────────────
export type PostVisibility = "public" | "friends" | "private";

export interface PostImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface Post {
  [x: string]: never[];
  id: string;
  author: User;
  content: string;
  images: PostImage[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved?: boolean;
  visibility: PostVisibility;
  createdAt: string; // ISO 8601
}

// ─── Feed ───────────────────────────────────────────────────────
export interface FeedPage {
  posts: Post[];
  nextCursor: string | null;
}

// ─── Messages & Conversations ────────────────────────────────────
export type MessageStatus = "sending" | "sent" | "delivered" | "read";
export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "CALL_EVENT";

export interface MediaAttachment {
  id: string;
  objectKey: string;
  bucket: string;
  mimeType: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUserId?: string; // from API
  content: string | null;
  messageType: MessageType;
  status: MessageStatus;
  createdAt: string; // ISO 8601
  attachments?: Array<{ mediaAsset: MediaAttachment }>;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message | null;
  unreadCount: number;
  /** true = non-friend sender → goes to "Tin nhắn chờ" tab */
  isRequest: boolean;
  updatedAt: string; // ISO 8601
}

// ─── Auth ───────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
}

// ─── Navigation ─────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  /** Lucide icon component name */
  icon: string;
}

// ─── Friendships ──────────────────────────────────────────────────
export type FriendRequestStatus = "pending" | "accepted" | "declined";

export interface FriendRequest {
  id: string;
  sender: User;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string; // ISO 8601
}

// ─── Notifications ────────────────────────────────────────────────
export type NotificationType =
  | "like_post"
  | "comment_post"
  | "friend_request"
  | "friend_accept"
  | "mention"
  | "POST_REACTION"
  | "LIKE_POST"
  | "COMMENT_POST"
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED";

export interface AppNotification {
  id: string;
  recipientId: string;
  actor: User;
  type: NotificationType;
  entityId: string; // ID of post/comment/request depending on type
  isRead: boolean;
  createdAt: string; // ISO 8601
}

// ─── Calls ────────────────────────────────────────────────────────
export type ParticipantRole = "host" | "guest";

export interface CallParticipant {
  id: string;
  user: User;
  role: ParticipantRole;
  isMicActive: boolean;
  isCameraActive: boolean;
  isSpeaking: boolean;
  /** Placeholder — will map to LiveKit TrackReference in real integration */
  videoTrackSid: string | null;
}

export interface CallRoom {
  id: string;
  name: string;
  startedAt: string; // ISO 8601
  callType?: "AUDIO" | "VIDEO";
  participants: CallParticipant[];
}

// ─── Post Comments ────────────────────────────────────────────────
export interface PostComment {
  id: string;
  postId: string;
  author: User;
  content: string;
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string; // ISO 8601
}
