import { CommentItem } from "./comment-item";
import type { PostComment, User } from "@/types";

// ─── CommentPreviewList ────────────────────────────────────────────
// Renders the 2 most recent comments beneath a post.
// In production this will be populated via TanStack Query.

interface CommentPreviewListProps {
  comments: PostComment[];
  maxVisible?: number;
  onReply?: (user: User) => void;
}

export function CommentPreviewList({
  comments,
  maxVisible = 2,
  onReply,
}: CommentPreviewListProps) {
  if (comments.length === 0) return null;

  const visible = comments.slice(0, maxVisible);
  const hidden = comments.length - maxVisible;

  return (
    <div className="space-y-3 pt-1">
      {visible.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onReply={onReply} />
      ))}

      {hidden > 0 && (
        <button
          className="text-xs font-medium text-primary hover:underline ml-11 cursor-pointer"
          type="button"
        >
          View {hidden} more {hidden === 1 ? "comment" : "comments"}
        </button>
      )}
    </div>
  );
}
