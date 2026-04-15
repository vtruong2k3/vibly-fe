import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";
import type { CursorPaginationParams } from "./posts.service";

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface SendFriendRequestDto {
  addresseeId: string;
}

// ─── Friendships Service ──────────────────────────────────────────────────────
export const friendshipsService = {
  listFriends: (params: CursorPaginationParams) =>
    apiClient.get(ENDPOINTS.friends.list, { params }).then((r) => r.data?.data ?? r.data),

  listRequests: () =>
    apiClient.get(ENDPOINTS.friends.requests).then((r) => r.data?.data ?? r.data),

  getStatus: (targetId: string) =>
    apiClient.get(ENDPOINTS.friends.status(targetId)).then((r) => (r.data?.data ?? r.data) as { status: 'none' | 'friends' | 'pending_incoming' | 'pending_outgoing' | 'self'; requestId: string | null; }),

  sendRequest: (dto: SendFriendRequestDto) =>
    apiClient.post(ENDPOINTS.friends.sendRequest, dto).then((r) => r.data?.data ?? r.data),

  acceptRequest: (requestId: string) =>
    apiClient.post(ENDPOINTS.friends.accept(requestId)).then((r) => r.data?.data ?? r.data),

  rejectRequest: (requestId: string) =>
    apiClient.post(ENDPOINTS.friends.reject(requestId)).then((r) => r.data?.data ?? r.data),

  cancelRequest: (requestId: string) =>
    apiClient.delete(ENDPOINTS.friends.cancel(requestId)).then((r) => r.data?.data ?? r.data),

  removeFriend: (userId: string) =>
    apiClient.delete(ENDPOINTS.friends.remove(userId)).then((r) => r.data?.data ?? r.data),

  blockUser: (userId: string) =>
    apiClient.post(ENDPOINTS.blocks.block(userId)).then((r) => r.data?.data ?? r.data),

  unblockUser: (userId: string) =>
    apiClient.delete(ENDPOINTS.blocks.unblock(userId)).then((r) => r.data?.data ?? r.data),
};
