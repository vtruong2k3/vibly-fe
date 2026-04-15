import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";
import type { CursorPaginationParams } from "./posts.service";
import type { Post } from "@/types";

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL ?? "";

// Map backend post format to frontend `Post` domain model
function mapPostResponse(postData: any): Post {
  const images = postData.media?.map((m: any) => ({
    url: `${cdnUrl}/${m.mediaAsset.objectKey}`,
    altText: m.mediaAsset.originalFilename || "Post attachment",
    width: m.mediaAsset.width || 800,
    height: m.mediaAsset.height || 600,
  })) || [];

  const author = {
    id: postData.author.id,
    username: postData.author.username,
    displayName: postData.author.profile?.displayName || postData.author.username,
    avatarUrl: postData.author.profile?.avatarUrl || null,
    bio: postData.author.profile?.bio || null,
    isOnline: false,
    createdAt: postData.author.createdAt || new Date().toISOString(),
  };

  return {
    ...postData,
    author,
    images,
    isLiked: !!postData.myReaction,
    likeCount: postData.reactionCount ?? 0,
    isSaved: postData.isSaved ?? false,
  };
}

// ─── Feed Service ─────────────────────────────────────────────────────────────
export const feedService = {
  getFeed: (params: CursorPaginationParams) =>
    apiClient.get(ENDPOINTS.feed.getFeed, { params }).then((r) => ({
      posts: r.data.data.map(mapPostResponse),
      nextCursor: r.data.meta?.nextCursor,
    })),

  getSavedPosts: (params: CursorPaginationParams) =>
    apiClient.get(ENDPOINTS.feed.getSaved, { params }).then((r) => ({
      posts: r.data.data.map(mapPostResponse),
      nextCursor: r.data.meta?.nextCursor,
    })),
};
