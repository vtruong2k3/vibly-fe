import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type {
  AdminUserListItem,
  AdminUserDetail,
  CursorPaginatedResponse,
  UserStatus,
  UserRole,
} from "@/types/admin.types";

type ApiEnvelope<T> = { success: boolean; data: T };

export interface UsersListParams {
  cursor?: string;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  sortBy?: "createdAt" | "lastLoginAt" | "postCount";
  createdFrom?: string;
  createdTo?: string;
}

export interface BulkActionPayload {
  userIds: string[];
  action: "SUSPEND" | "ACTIVATE" | "BAN";
  reason: string;
}

const adminUsersService = {
  list: async (params: UsersListParams = {}): Promise<CursorPaginatedResponse<AdminUserListItem>> => {
    const { data } = await adminApiClient.get<CursorPaginatedResponse<AdminUserListItem>>(
      ADMIN_ENDPOINTS.users.list,
      { params },
    );
    return data; // BE returns meta at the top level
  },

  getById: async (id: string): Promise<AdminUserDetail> => {
    const { data } = await adminApiClient.get<ApiEnvelope<AdminUserDetail>>(
      ADMIN_ENDPOINTS.users.byId(id),
    );
    return data.data;
  },

  updateStatus: async (id: string, status: UserStatus, reason?: string): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.users.updateStatus(id), {
      status,
      ...(reason ? { reason } : {}),
    });
  },

  updateRole: async (id: string, role: Exclude<UserRole, "ADMIN">): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.users.updateRole(id), { role });
  },

  bulkAction: async (payload: BulkActionPayload): Promise<void> => {
    await adminApiClient.post(ADMIN_ENDPOINTS.users.bulkAction, payload);
  },
};

export default adminUsersService;
