import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type {
  AdminAccountListItem,
  AdminAccountDetail,
  AdminAccountStats,
  CursorPaginatedResponse,
  UserStatus,
  UserRole,
} from "@/types/admin.types";

type ApiEnvelope<T> = { success: boolean; data: T };

export interface AccountsListParams {
  cursor?: string;
  limit?: number;
  role?: Extract<UserRole, "ADMIN" | "MODERATOR">;
  search?: string;
}

const adminAccountsService = {
  list: async (params: AccountsListParams = {}): Promise<CursorPaginatedResponse<AdminAccountListItem>> => {
    const { data } = await adminApiClient.get<CursorPaginatedResponse<AdminAccountListItem>>(
      ADMIN_ENDPOINTS.accounts.list,
      { params },
    );
    return data;
  },

  getStats: async (): Promise<AdminAccountStats> => {
    const { data } = await adminApiClient.get<ApiEnvelope<AdminAccountStats>>(
      ADMIN_ENDPOINTS.accounts.stats,
    );
    return data.data;
  },

  getById: async (id: string): Promise<AdminAccountDetail> => {
    const { data } = await adminApiClient.get<ApiEnvelope<AdminAccountDetail>>(
      ADMIN_ENDPOINTS.accounts.byId(id),
    );
    return data.data;
  },

  updateRole: async (id: string, role: Exclude<UserRole, "ADMIN">): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.accounts.updateRole(id), { role });
  },

  updateStatus: async (id: string, status: UserStatus, reason?: string): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.accounts.updateStatus(id), {
      status,
      ...(reason ? { reason } : {}),
    });
  },
};

export default adminAccountsService;
