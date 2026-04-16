import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateConversationDto {
  participantIds: string[];
  type?: "DIRECT" | "GROUP";
}

export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "CALL_EVENT";

export interface SendMessageDto {
  content?: string;
  messageType?: MessageType;
  mediaIds?: string[];
  replyToMessageId?: string;
}

export interface PresignedUrlDto {
  mimeType: string;
  mediaType: "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
  originalFilename: string;
  sizeBytes?: number;
}

// ─── Chat Service ─────────────────────────────────────────────────────────────
export const chatService = {
  getConversations: () =>
    apiClient.get(ENDPOINTS.conversations.list).then((r) => {
      const raw = r.data?.data ?? r.data;
      return Array.isArray(raw) ? raw : [];
    }),

  createConversation: (dto: CreateConversationDto) =>
    apiClient.post(ENDPOINTS.conversations.create, dto).then((r) => {
      return r.data?.data ?? r.data;
    }),

  getMessages: (conversationId: string, cursor?: string) =>
    apiClient
      .get(ENDPOINTS.messages.list(conversationId), {
        params: cursor ? { cursor, limit: 30 } : { limit: 30 },
      })
      .then((r) => {
        const raw = r.data?.data ?? r.data;
        return {
          data: Array.isArray(raw) ? raw : raw?.data ?? [],
          meta: raw?.meta ?? { nextCursor: null },
        };
      }),

  sendMessage: (conversationId: string, dto: SendMessageDto) =>
    apiClient
      .post(ENDPOINTS.messages.send(conversationId), dto)
      .then((r) => r.data?.data ?? r.data),

  markRead: (conversationId: string) =>
    apiClient.patch(ENDPOINTS.conversations.markRead(conversationId)).then((r) => r.data),

  // ─── Media: presigned upload → confirm ──────────────────────────
  requestPresignedUrl: (dto: PresignedUrlDto) =>
    apiClient.post(ENDPOINTS.media.presignedUrl, dto).then((r) => r.data?.data ?? r.data) as
      Promise<{ mediaAssetId: string; presignedUrl: string; objectKey: string; expiresIn: number }>,

  confirmUpload: (mediaAssetId: string) =>
    apiClient.patch(ENDPOINTS.media.confirm(mediaAssetId)).then((r) => r.data?.data ?? r.data),

  /** Upload file directly to S3 via presigned URL (no auth header needed) */
  uploadToS3: (presignedUrl: string, file: File) =>
    fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    }),
};
