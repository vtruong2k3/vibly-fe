"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LikeButton,
  CommentButton,
} from "@/features/feed/components/reaction-button";
import { ShareAction } from "@/features/feed/components/share-action";

// ─── PostActionsRow ────────────────────────────────────────────────
// Bottom action bar of a PostCard.
// Receives computed state (isLiked, counts) + handlers from parent.

interface PostActionsRowProps {
  postUrl: string;
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  shareCount: number;
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
        className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 mr-[-4px]"
        aria-label="Save post"
        onClick={onBookmark}
      >
        <Bookmark className="h-[18px] w-[18px]" />
      </Button>
    </div>
  );
}
