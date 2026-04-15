"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { ReplyAction } from "./reply-action";
import { useMe } from "@/hooks/use-users";
import type { User } from "@/types";

// ─── CommentInput ──────────────────────────────────────────────────

interface CommentInputProps {
  postId: string;
  replyToUser: User | null;
  onCancelReply: () => void;
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
}

export function CommentInput({
  postId,
  replyToUser,
  onCancelReply,
  onSubmit,
  isSubmitting = false,
}: CommentInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: me } = useMe();

  // Auto-focus when replying to someone
  useEffect(() => {
    if (replyToUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyToUser]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isSubmitting) return;

    const content = replyToUser
      ? `@${replyToUser.username} ${trimmed}`
      : trimmed;

    onSubmit(content);
    setValue("");
    onCancelReply();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-start gap-3 pt-1"
      aria-label="Viết bình luận"
    >
      <UserAvatar user={me} size="sm" className="shrink-0 mt-1" />

      <div className="flex-1 flex flex-col">
        <ReplyAction replyToUser={replyToUser} onCancelReply={onCancelReply} />
        <div className="relative z-10 bg-background rounded-2xl">
          <textarea
            ref={inputRef}
            id={`comment-input-${postId}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={
              replyToUser
                ? `Phản hồi @${replyToUser.username}...`
                : "Viết bình luận..."
            }
            rows={1}
            maxLength={500}
            disabled={isSubmitting}
            className="w-full resize-none rounded-2xl bg-muted/60 border-transparent px-4 py-2.5 pr-10 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border hover:bg-muted/80 transition-colors shadow-none"
            style={{ fieldSizing: "content" } as React.CSSProperties}
            aria-label="Nội dung bình luận"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!value.trim() || isSubmitting}
            className="absolute right-1.5 bottom-[5px] h-7 w-7 rounded-full text-primary hover:bg-primary/10 disabled:opacity-30"
            aria-label="Gửi bình luận"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
