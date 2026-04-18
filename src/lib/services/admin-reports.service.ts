import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type {
  AdminReportListItem,
  CursorPaginatedResponse,
  ReportStatus,
  ReportSeverity,
  ReportTargetType,
} from "@/types/admin.types";

type ApiEnvelope<T> = { success: boolean; data: T };

export interface ReportsListParams {
  cursor?: string;
  limit?: number;
  status?: ReportStatus;
  severity?: ReportSeverity;
  targetType?: ReportTargetType;
  moderatorId?: string;
  assignedToMe?: boolean;
}

const adminReportsService = {
  list: async (params: ReportsListParams = {}): Promise<CursorPaginatedResponse<AdminReportListItem>> => {
    const { data } = await adminApiClient.get<CursorPaginatedResponse<AdminReportListItem>>(
      ADMIN_ENDPOINTS.reports.list,
      {
        params: {
          ...params,
          assignedToMe: params.assignedToMe !== undefined ? String(params.assignedToMe) : undefined,
        },
      },
    );
    return data;
  },

  markReviewing: async (id: string): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.reports.reviewing(id));
  },

  resolve: async (id: string, resolveNote: string): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.reports.resolve(id), { resolveNote });
  },

  dismiss: async (id: string, reason: string): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.reports.dismiss(id), { reason });
  },

  escalate: async (id: string, severity: ReportSeverity): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.reports.escalate(id), { severity });
  },
};

export default adminReportsService;
