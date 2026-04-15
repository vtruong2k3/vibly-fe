import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export type ReportTargetType = "USER" | "POST" | "COMMENT" | "MESSAGE";
export type ModerationActionType =
  | "HIDE_POST"
  | "DELETE_COMMENT"
  | "SUSPEND_USER"
  | "WARN_USER"
  | "RESTORE"
  | "DELETE_MESSAGE";

export interface CreateReportDto {
  targetType: ReportTargetType;
  targetId: string;
  reasonCode: string;
  reasonText?: string;
}

export interface ModerationActionDto {
  reportId?: string;
  targetType: ReportTargetType;
  targetId: string;
  actionType: ModerationActionType;
  note?: string;
}

// ─── Moderation Service ───────────────────────────────────────────────────────
export const moderationService = {
  createReport: (dto: CreateReportDto) =>
    apiClient.post(ENDPOINTS.moderation.report, dto).then((r) => r.data),

  getReports: (params: { status: string; cursor: string; limit: number }) =>
    apiClient.get(ENDPOINTS.moderation.reports, { params }).then((r) => r.data),

  takeAction: (dto: ModerationActionDto) =>
    apiClient.post(ENDPOINTS.moderation.action, dto).then((r) => r.data),
};

// ─── Presence Service ─────────────────────────────────────────────────────────
export const presenceService = {
  getStatuses: (ids: string[]) =>
    apiClient
      .get(ENDPOINTS.presence.statuses, { params: { ids: ids.join(",") } })
      .then((r) => r.data),
};
