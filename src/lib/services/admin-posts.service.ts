import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type {
  AdminPostListItem,
  AdminPostDetail,
  CursorPaginatedResponse,
  PostStatus,
} from "@/types/admin.types";

type ApiEnvelope<T> = { success: boolean; data: T };

export interface PostsListParams {
  cursor?: string;
  limit?: number;
  status?: PostStatus;
  authorId?: string;
  hasReports?: boolean;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

const adminPostsService = {
  list: async (params: PostsListParams = {}): Promise<CursorPaginatedResponse<AdminPostListItem>> => {
    const { data } = await adminApiClient.get<CursorPaginatedResponse<AdminPostListItem>>(
      ADMIN_ENDPOINTS.posts.list,
      {
        params: {
          ...params,
          hasReports: params.hasReports !== undefined ? String(params.hasReports) : undefined,
        },
      },
    );
    return data;
  },

  getById: async (id: string): Promise<AdminPostDetail> => {
    const { data } = await adminApiClient.get<ApiEnvelope<AdminPostDetail>>(
      ADMIN_ENDPOINTS.posts.byId(id),
    );
    return data.data;
  },

  remove: async (id: string, reason: string): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.posts.remove(id), { reason });
  },

  restore: async (id: string): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.posts.restore(id));
  },
};

export default adminPostsService;
