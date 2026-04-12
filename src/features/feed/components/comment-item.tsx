import { formatDistanceToNow } from "date-fns";
import { Heart, CornerDownRight } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import type { PostComment, User } from "@/types";

// ─── CommentItem ───────────────────────────────────────────────────
// Renders a single comment row: avatar, content, timestamp, like, reply.
// Theme-aware: works in both light and dark mode via CSS tokens.

interface CommentItemProps {
  comment: PostComment;
  onReply?: (user: User) => void;
}

export function CommentItem({ comment, onReply }: CommentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <UserAvatar user={comment.author} size="sm" className="mt-0.5" />

      {/* Content bubble */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="bg-muted/50 rounded-[20px] px-3.5 py-2.5 inline-block max-w-full">
          <Link
            href={`/profile/${comment.author.username}`}
            className="text-[13px] font-bold text-foreground hover:underline"
          >
            {comment.author.displayName}
          </Link>
          <p className="text-[14px] text-foreground leading-[1.4] mt-1 break-words">
            {comment.content}
          </p>
        </div>

        {/* Meta actions */}
        <div className="flex items-center gap-3 mt-1 ml-1">
          <time className="text-[11px] text-muted-foreground">{timeAgo}</time>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto px-0 py-0 text-[11px] font-medium gap-1 text-muted-foreground hover:text-destructive",
              comment.isLiked && "text-destructive",
            )}
            aria-label="Like comment"
          >
            <Heart
              className={cn("h-3 w-3", comment.isLiked && "fill-current")}
            />
            {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-0 py-0 text-[11px] font-medium text-muted-foreground hover:text-primary gap-1"
            aria-label="Reply to comment"
            onClick={() => onReply?.(comment.author)}
          >
            <CornerDownRight className="h-3 w-3" />
            Reply
            {comment.replyCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                ({comment.replyCount})
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
