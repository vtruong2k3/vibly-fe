"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PostActionsRow } from "./post-actions-row";
import { CommentPreviewList } from "./comment-preview-list";
import { CommentInput } from "./comment-input";
import { getMockComments } from "@/lib/mock-data/post-interactions";
import { UserHeader } from "@/components/shared/user-header";
import type { Post, User } from "@/types";


// ─── Props ────────────────────────────────────────────────────────
interface PostCardProps {
  post: Post;
}

// ─── PostCard Component ───────────────────────────────────────────
// Composition shell: delegates action bar and comments to sub-components.
export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [replyToUser, setReplyToUser] = useState<User | null>(null);

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleComment = () => {
    setShowComments((prev) => !prev);
    if (showComments) setReplyToUser(null);
  };

  const handleReply = (user: User) => {
    setShowComments(true);
    setReplyToUser(user);
  };

  const previewComments = getMockComments(post.id);

  return (
    <article className="vibly-card p-5 space-y-4 transition-all duration-200">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <UserHeader
          user={post.author}
          size="lg"
          subtitle={`${timeAgo} • ${post.visibility === "public" ? "Public" : "Friends"}`}
          showOnlineBadge
        />

        {/* More options */}
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

      {/* ── Content ── */}
      <p className="text-[15px] text-foreground leading-[1.6] whitespace-pre-wrap px-1">
        {post.content}
      </p>

      {/* ── Images ── */}
      {post.images.length > 0 && (
        <div
          className={cn(
            "grid gap-2 rounded-2xl overflow-hidden mt-1",
            post.images.length === 1 ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          {post.images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              className={cn(
                "relative bg-muted overflow-hidden",
                post.images.length === 1 ? "aspect-video" : "aspect-square",
              )}
            >
              <Image
                src={img.url}
                alt={img.altText}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Action Bar (refactored) ── */}
      <PostActionsRow
        postUrl={`https://vibly.app/post/${post.id}`}
        likeCount={likeCount}
        isLiked={isLiked}
        commentCount={post.commentCount}
        shareCount={post.shareCount}
        onLike={handleLike}
        onComment={handleComment}
        onBookmark={() => console.log("Bookmarked:", post.id)}
      />

      {/* ── Comment section (expanded on click) ── */}
      {showComments && (
        <div className="space-y-3 pt-1">
          <CommentPreviewList comments={previewComments} onReply={handleReply} />
          <CommentInput
            postId={post.id}
            replyToUser={replyToUser}
            onCancelReply={() => setReplyToUser(null)}
          />
        </div>
      )}
    </article>
  );
}
