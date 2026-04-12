"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { ReplyAction } from "./reply-action";
import { MOCK_CURRENT_USER } from "@/lib/mock-data/feed";
import type { User } from "@/types";

// ─── CommentInput ──────────────────────────────────────────────────
// Auto-expanding textarea for composing new comments on a post.
// On submit, logs the value (no backend yet).

interface CommentInputProps {
  postId: string;
  replyToUser: User | null;
  onCancelReply: () => void;
}

export function CommentInput({ postId, replyToUser, onCancelReply }: CommentInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto focus when replyToUser changes
  useEffect(() => {
    if (replyToUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyToUser]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    if (replyToUser) {
      console.log("[CommentInput] Reply to", replyToUser.username, "for post:", postId, "->", value);
      onCancelReply();
    } else {
      console.log("[CommentInput] Submit for post:", postId, "->", value);
    }
    
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-start gap-3 pt-1"
      aria-label="Write a comment"
    >
      <UserAvatar user={MOCK_CURRENT_USER} size="sm" className="shrink-0 mt-1" />

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
            placeholder={replyToUser ? `Replying to @${replyToUser.username}...` : "Write a comment..."}
            rows={1}
            maxLength={500}
            className="w-full resize-none rounded-2xl bg-muted/60 border-transparent px-4 py-2.5 pr-10 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border hover:bg-muted/80 transition-colors shadow-none"
            style={{ fieldSizing: "content" } as React.CSSProperties}
            aria-label="Comment text"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!value.trim()}
            className="absolute right-1.5 bottom-[5px] h-7 w-7 rounded-full text-primary hover:bg-primary/10 disabled:opacity-30"
            aria-label="Post comment"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
