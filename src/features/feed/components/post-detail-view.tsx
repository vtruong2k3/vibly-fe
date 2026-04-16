"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PostActionsRow } from "./post-actions-row";
import { CommentInput } from "./comment-input";
import { CommentPreviewList } from "./comment-preview-list";
import { getMockComments } from "@/lib/mock-data/post-interactions";
import { MOCK_POSTS } from "@/lib/mock-data/feed";
import { UserHeader } from "@/components/shared/user-header";
import { EmptyState } from "@/components/shared/empty-state";
import type { User } from "@/types";

interface PostDetailViewProps {
  postId: string;
}

// ─── PostDetailView Component ─────────────────────────────────────
// Feature Component: loads and renders a full post with all comments expanded.
// TODO: Replace MOCK_POSTS lookup with React Query: GET /posts/:id
export function PostDetailView({ postId }: PostDetailViewProps) {
  const post = MOCK_POSTS.find((p) => p.id === postId);

  const [isLiked, setIsLiked] = useState(post?.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0);
  const [replyToUser, setReplyToUser] = useState<User | null>(null);

  if (!post) {
    return (
      <EmptyState
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="lucide lucide-file-question"
            aria-hidden="true"
          >
            <path d="M12 17h.01" />
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
            <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" />
          </svg>
        }
        headline="Post not found"
        description="This post may have been deleted or is not visible to you."
      />
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleReply = (user: User) => {
    setReplyToUser(user);
  };

  const allComments = getMockComments(post.id);

  return (
    <article className="space-y-6">
      {/* ── Post Card ── */}
      <div className="vibly-card p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <UserHeader
            user={post.author}
            size="lg"
            subtitle={`${timeAgo} • ${post.visibility === "public" ? "Public" : "Friends"}`}
            showOnlineBadge
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground"
                aria-label="Post options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem>Save post</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <p className="text-[15px] text-foreground leading-[1.6] whitespace-pre-wrap px-1">
          {post.content}
        </p>

        {/* Images */}
        {post.images.length > 0 && (
          <div
            className={cn(
              "grid gap-2 rounded-2xl overflow-hidden mt-1",
              post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            {post.images.map((img, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative bg-muted overflow-hidden",
                  post.images.length === 1 ? "aspect-video" : "aspect-square"
                )}
              >
                <Image
                  src={img.url}
                  alt={img.altText}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <PostActionsRow
          postUrl={`https://vibly.app/post/${post.id}`}
          likeCount={likeCount}
          isLiked={isLiked}
          commentCount={post.commentCount}
          shareCount={post.shareCount}
          onLike={handleLike}
          onComment={() => {}}
          onBookmark={() => console.log("Bookmarked:", post.id)}
        />
      </div>

      {/* ── All Comments Section ── */}
      <section aria-label="Comments" className="vibly-card p-5 space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Comments{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({post.commentCount})
          </span>
        </h2>

        {/* Comment Input at top */}
        <CommentInput
          postId={post.id}
          replyToUser={replyToUser}
          onCancelReply={() => setReplyToUser(null)}
          onSubmit={(content) => {}}
        />

        {/* Comment list — all expanded, not just preview */}
        {allComments.length > 0 ? (
          <CommentPreviewList comments={allComments} onReply={handleReply} />
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No comments yet. Be the first to comment!
          </p>
        )}
      </section>
    </article>
  );
}

// ─── PostDetailSkeleton ───────────────────────────────────────────
export function PostDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="vibly-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="vibly-card p-5 space-y-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-11 w-full rounded-xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-16 flex-1 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
