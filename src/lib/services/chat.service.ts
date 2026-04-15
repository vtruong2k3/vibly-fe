import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateConversationDto {
  participantIds: string[];
  type?: "DIRECT" | "GROUP";
}

export interface SendMessageDto {
  content: string;
  messageType?: "TEXT";
  replyToMessageId?: string;
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
};
