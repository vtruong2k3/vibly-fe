"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Bookmark } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useReactToPost, useSavePost, useCommentsQuery, useCreateComment } from "@/hooks/use-feed";
import { UserHeader } from "@/components/shared/user-header";
import type { Post, User } from "@/types";


// ─── Props ────────────────────────────────────────────────────────
interface PostCardProps {
  post: Post;
}

// ─── PostCard Component ───────────────────────────────────────────
export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false);
  const [showComments, setShowComments] = useState(false);
  const [replyToUser, setReplyToUser] = useState<User | null>(null);

  // Sync internal state when React Query pushes fresh data (from WebSocket)
  useEffect(() => { setLikeCount(post.likeCount); }, [post.likeCount]);
  useEffect(() => { setIsLiked(post.isLiked); }, [post.isLiked]);

  const { mutate: react } = useReactToPost(post.id);
  const { mutate: save } = useSavePost(post.id);

  // Lazy-load: only fires when showComments = true
  const { data: commentsData, isLoading: commentsLoading } = useCommentsQuery(post.id, showComments);
  const { mutate: submitComment, isPending: isSubmitting } = useCreateComment(post.id);

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // Flatten pages into a flat comment array
  const comments = commentsData?.pages.flatMap((p) => p.comments) ?? [];

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev) => prev + (newIsLiked ? 1 : -1));
    react({ dto: { reactionType: "LIKE" }, isRemoving: !newIsLiked });
  };

  const handleComment = () => {
    setShowComments((prev) => !prev);
    if (showComments) setReplyToUser(null);
  };

  const handleReply = (user: User) => {
    setShowComments(true);
    setReplyToUser(user);
  };

  const handleBookmark = () => {
    const saving = !isSaved;
    setIsSaved(saving);
    save({ saving });
  };

  return (
    <article className="vibly-card p-5 space-y-4 transition-all duration-200">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <UserHeader
          user={post.author}
          size="lg"
          subtitle={`${timeAgo} • ${post.visibility === "public" ? "Công khai" : "Bạn bè"}`}
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
            <DropdownMenuItem onClick={handleBookmark}>
              {isSaved ? "Bỏ lưu bài" : "Lưu bài viết"}
            </DropdownMenuItem>
            <DropdownMenuItem>Sao chép liên kết</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Báo cáo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Content ── */}
      {post.content && (
        <p className="text-[15px] text-foreground leading-[1.6] whitespace-pre-wrap px-1">
          {post.content}
        </p>
      )}

      {/* ── Images ── */}
      {post.images && post.images.length > 0 && (
        <div
          className={cn(
            "grid gap-2 mt-1",
            post.images.length === 1 ? "grid-cols-1" : "grid-cols-2 rounded-2xl overflow-hidden",
          )}
        >
          {post.images.slice(0, 4).map((img, idx) => {
            const isSingle = post.images!.length === 1;

            if (isSingle) {
              return (
                <div key={idx} className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center w-full max-h-[500px]">
                  <Image
                    src={img.url}
                    alt={img.altText}
                    width={1000}
                    height={1000}
                    className="w-full h-auto max-h-[500px] object-contain"
                    sizes="(max-width: 640px) 100vw, 80vw"
                  />
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="relative bg-muted overflow-hidden aspect-square"
              >
                <Image
                  src={img.url}
                  alt={img.altText}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Action Bar ── */}
      <PostActionsRow
        postUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/post/${post.id}`}
        likeCount={likeCount}
        isLiked={isLiked}
        commentCount={post.commentCount}
        shareCount={post.shareCount}
        isSaved={isSaved}
        onLike={handleLike}
        onComment={handleComment}
        onBookmark={handleBookmark}
      />

      {/* ── Comment section — only rendered after first click ── */}
      {showComments && (
        <div className="space-y-3 pt-1">
          {commentsLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pl-1">
              <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
              Đang tải bình luận...
            </div>
          )}
          {!commentsLoading && (
            <CommentPreviewList comments={comments} onReply={handleReply} />
          )}
          <CommentInput
            postId={post.id}
            replyToUser={replyToUser}
            onCancelReply={() => setReplyToUser(null)}
            onSubmit={(content) => submitComment(content)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </article>
  );
}
