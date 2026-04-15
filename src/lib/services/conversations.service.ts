import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";
import type { CursorPaginationParams } from "./posts.service";

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export type ConversationType = "DIRECT" | "GROUP";
export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "SYSTEM" | "CALL_EVENT";

export interface CreateConversationDto {
  type: ConversationType;
  name?: string; // required for GROUP
  participantIds: string[];
}

export interface CreateMessageDto {
  messageType: MessageType;
  content?: string;
  mediaIds?: string[];
}

// ─── Conversations Service ────────────────────────────────────────────────────
export const conversationsService = {
  create: (dto: CreateConversationDto) =>
    apiClient.post(ENDPOINTS.conversations.create, dto).then((r) => r.data),

  list: () =>
    apiClient.get(ENDPOINTS.conversations.list).then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch(ENDPOINTS.conversations.markRead(id)).then((r) => r.data),
};

// ─── Messages Service ─────────────────────────────────────────────────────────
export const messagesService = {
  list: (conversationId: string, params: CursorPaginationParams) =>
    apiClient
      .get(ENDPOINTS.messages.list(conversationId), { params })
      .then((r) => r.data),

  send: (conversationId: string, dto: CreateMessageDto) =>
    apiClient
      .post(ENDPOINTS.messages.send(conversationId), dto)
      .then((r) => r.data),

  edit: (id: string, content: string) =>
    apiClient.patch(ENDPOINTS.messages.edit(id), { content }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.messages.delete(id)).then((r) => r.data),
};
