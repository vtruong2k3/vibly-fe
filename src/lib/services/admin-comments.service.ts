import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type {
  AdminCommentListItem,
  CursorPaginatedResponse,
} from "@/types/admin.types";

type ApiEnvelope<T> = { success: boolean; data: T };

export interface CommentsListParams {
  cursor?: string;
  limit?: number;
  postId?: string;
  authorId?: string;
  hasReports?: boolean;
}

const adminCommentsService = {
  list: async (params: CommentsListParams = {}): Promise<CursorPaginatedResponse<AdminCommentListItem>> => {
    const { data } = await adminApiClient.get<CursorPaginatedResponse<AdminCommentListItem>>(
      ADMIN_ENDPOINTS.comments.list,
      {
        params: {
          ...params,
          hasReports: params.hasReports !== undefined ? String(params.hasReports) : undefined,
        },
      },
    );
    return data;
  },

  remove: async (id: string, reason: string): Promise<void> => {
    await adminApiClient.patch(ADMIN_ENDPOINTS.comments.remove(id), { reason });
  },
};

export default adminCommentsService;
