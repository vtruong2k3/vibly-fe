import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";
export type PostVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

export interface CreatePostDto {
  content?: string;
  visibility?: PostVisibility;
  mediaIds?: string[];
}

export interface UpdatePostDto {
  content?: string;
  visibility?: PostVisibility;
}

export interface ReactDto {
  reactionType: ReactionType;
}

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

// ─── Posts Service ────────────────────────────────────────────────────────────
export const postsService = {
  createPost: (dto: CreatePostDto) =>
    apiClient.post(ENDPOINTS.posts.create, dto).then((r) => r.data),

  getPost: (id: string) =>
    apiClient.get(ENDPOINTS.posts.byId(id)).then((r) => r.data),

  updatePost: (id: string, dto: UpdatePostDto) =>
    apiClient.patch(ENDPOINTS.posts.update(id), dto).then((r) => r.data),

  deletePost: (id: string) =>
    apiClient.delete(ENDPOINTS.posts.delete(id)).then((r) => r.data),

  reactToPost: (id: string, dto: ReactDto) =>
    apiClient.post(ENDPOINTS.posts.react(id), dto).then((r) => r.data),

  removeReaction: (id: string) =>
    apiClient.delete(ENDPOINTS.posts.removeReaction(id)).then((r) => r.data),

  addComment: (id: string, dto: CreateCommentDto) =>
    apiClient.post(ENDPOINTS.posts.addComment(id), dto).then((r) => r.data),

  getComments: (id: string, params: CursorPaginationParams) =>
    apiClient.get(ENDPOINTS.posts.getComments(id), { params }).then((r) => r.data),

  savePost: (id: string) =>
    apiClient.post(ENDPOINTS.posts.save(id)).then((r) => r.data),

  unsavePost: (id: string) =>
    apiClient.delete(ENDPOINTS.posts.unsave(id)).then((r) => r.data),
};
