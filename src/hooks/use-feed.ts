"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { feedService } from "@/lib/services/feed.service";
import { postsService, type CreatePostDto, type ReactDto } from "@/lib/services/posts.service";
import { QUERY_KEYS } from "@/lib/api/constants";

const DEFAULT_LIMIT = 10;

// ─── useFeedQuery — infinite scroll, cursor-based ────────────────────────────
export function useFeedQuery() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.feed,
    queryFn: ({ pageParam }) =>
      feedService.getFeed({ cursor: pageParam as string | undefined, limit: DEFAULT_LIMIT }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });
}

// ─── useCreatePost ────────────────────────────────────────────────────────────
export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePostDto) => postsService.createPost(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feed });
      toast.success("Post published!");
    },
    onError: () => toast.error("Failed to publish post. Try again."),
  });
}

// ─── useReactToPost — optimistic update ───────────────────────────────────────
export function useReactToPost(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, isRemoving }: { dto: ReactDto; isRemoving: boolean }) =>
      isRemoving
        ? postsService.removeReaction(postId)
        : postsService.reactToPost(postId, dto),
    onMutate: async ({ isRemoving }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.feed });
      const prev = queryClient.getQueryData(QUERY_KEYS.feed);
      queryClient.setQueryData(
        QUERY_KEYS.feed,
        (old: { pages: { posts: { id: string; isLiked: boolean; likeCount: number }[] }[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? { ...p, isLiked: !isRemoving, likeCount: p.likeCount + (isRemoving ? -1 : 1) }
                  : p,
              ),
            })),
          };
        },
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(QUERY_KEYS.feed, ctx.prev);
      toast.error("Reaction failed.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feed }),
  });
}

// ─── useSavePost ──────────────────────────────────────────────────────────────
export function useSavePost(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ saving }: { saving: boolean }) =>
      saving ? postsService.savePost(postId) : postsService.unsavePost(postId),
    onSuccess: (_, { saving }) => {
      toast.success(saving ? "Đã lưu bài viết!" : "Đã bỏ lưu.");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedSaved });
    },
    onError: () => toast.error("Thao tác thất bại. Vui lòng thử lại."),
  });
}

// ─── useCommentsQuery — lazy-load only when enabled ───────────────────────────
export function useCommentsQuery(postId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.postComments(postId),
    queryFn: ({ pageParam }) =>
      postsService.getComments(postId, {
        cursor: pageParam as string | undefined,
        limit: 10,
      }).then((r) => ({
        comments: r.data?.map(mapComment) ?? [],
        nextCursor: r.meta?.nextCursor ?? null,
      })),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled, // 🔑 Only fetches when user opens the comment section
  });
}

// Map backend comment shape → PostComment type
function mapComment(c: any) {
  return {
    id: c.id,
    postId: c.postId,
    content: c.content,
    likeCount: c.reactionCount ?? 0,
    replyCount: c.replyCount ?? 0,
    isLiked: false,
    createdAt: c.createdAt,
    author: {
      id: c.author.id,
      username: c.author.username,
      displayName: c.author.profile?.displayName || c.author.username,
      avatarUrl: c.author.profile?.avatarUrl ?? null,
      bio: null,
      isOnline: false,
      createdAt: c.author.createdAt ?? new Date().toISOString(),
    },
  };
}

// ─── useCreateComment ─────────────────────────────────────────────────────────
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      postsService.addComment(postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postComments(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feed });
    },
    onError: () => toast.error("Gửi bình luận thất bại."),
  });
}
