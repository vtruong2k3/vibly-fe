import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type { AuditLogEntry, CursorPaginatedResponse } from "@/types/admin.types";

type ApiEnvelope<T> = { success: boolean; data: T };

export interface AuditLogsListParams {
  cursor?: string;
  limit?: number;
  actorId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
}

const adminAuditLogsService = {
  list: async (params: AuditLogsListParams = {}): Promise<CursorPaginatedResponse<AuditLogEntry>> => {
    const { data } = await adminApiClient.get<CursorPaginatedResponse<AuditLogEntry>>(
      ADMIN_ENDPOINTS.auditLogs.list,
      { params },
    );
    return data;
  },
};

export default adminAuditLogsService;
