"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LikeButton,
  CommentButton,
} from "@/features/feed/components/reaction-button";
import { ShareAction } from "@/features/feed/components/share-action";

// ─── PostActionsRow ────────────────────────────────────────────────
interface PostActionsRowProps {
  postUrl: string;
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  shareCount: number;
  isSaved?: boolean;
  onLike: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export function PostActionsRow({
  postUrl,
  likeCount,
  isLiked,
  commentCount,
  shareCount,
  isSaved = false,
  onLike,
  onComment,
  onBookmark,
}: PostActionsRowProps) {
  return (
    <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/40">
      <div className="flex items-center gap-1.5 ml-[-4px]">
        <LikeButton likeCount={likeCount} isLiked={isLiked} onClick={onLike} />
        <CommentButton commentCount={commentCount} onClick={onComment} />
        <ShareAction postUrl={postUrl} shareCount={shareCount} />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 mr-[-4px] transition-colors",
          isSaved && "text-primary"
        )}
        aria-label={isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
        onClick={onBookmark}
      >
        <Bookmark className={cn("h-[18px] w-[18px]", isSaved && "fill-current")} />
      </Button>
    </div>
  );
}
