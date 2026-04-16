import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export type CallType = "AUDIO" | "VIDEO";

export interface StartCallDto {
  callType: CallType;
  participantIds: string[];
  conversationId?: string;
}

// ─── Calls Service ────────────────────────────────────────────────────────────
export const callsService = {
  start: (dto: StartCallDto) =>
    apiClient.post(ENDPOINTS.calls.start, dto).then((r) => r.data.data),

  getToken: (id: string) =>
    apiClient.post(ENDPOINTS.calls.token(id)).then((r) => r.data.data),

  accept: (id: string) =>
    apiClient.post(ENDPOINTS.calls.accept(id)).then((r) => r.data.data),

  reject: (id: string) =>
    apiClient.post(ENDPOINTS.calls.reject(id)).then((r) => r.data.data),

  end: (id: string) =>
    apiClient.post(ENDPOINTS.calls.end(id)).then((r) => r.data.data),

  getSession: (id: string) =>
    apiClient.get(ENDPOINTS.calls.session(id)).then((r) => r.data.data),

  getIceServers: () =>
    apiClient.get(ENDPOINTS.calls.iceServers).then((r) => r.data.data),
};
