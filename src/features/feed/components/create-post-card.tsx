"use client";

import { useState } from "react";
import { Video, Image as ImageIcon, Smile, Send, PenSquare } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MOCK_CURRENT_USER } from "@/lib/mock-data/feed";

// ─── CreatePostCard ───────────────────────────────────────────────
// Composer for creating a new post. Purely UI — no API call yet.
export function CreatePostCard() {
  const [content, setContent] = useState("");
  const isFilled = content.trim().length > 0;

  const handlePost = () => {
    if (!isFilled) return;
    // TODO: Replace with createPostMutation when backend integrated
    console.log("[Mock Post]", { content });
    setContent("");
  };

  return (
    <div className="vibly-card p-5 space-y-4">
      <div className="flex gap-4">
        <UserAvatar user={MOCK_CURRENT_USER} className="shrink-0 h-[42px] w-[42px]" />

        <Textarea
          id="create-post-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${MOCK_CURRENT_USER.displayName.split(" ")[0]}?`}
          className="resize-none rounded-3xl border-transparent bg-muted/60 focus-visible:ring-1 focus-visible:ring-border hover:bg-muted/80 min-h-[46px] max-h-40 py-3 px-5 text-[15px] font-medium leading-relaxed transition-colors shadow-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
          }}
        />
      </div>

      <div className="flex items-center justify-between pl-[58px]">
        {/* Attachment actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full text-[13px] font-semibold h-9 px-4"
            aria-label="Attach photo"
          >
            <ImageIcon className="h-[18px] w-[18px]" />
            Photo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-[--color-success] hover:bg-success/10 rounded-full text-[13px] font-semibold h-9 px-4"
            aria-label="Attach video"
          >
            <Video className="h-[18px] w-[18px]" />
            Video
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-full text-[13px] font-semibold h-9 px-4"
            aria-label="Add feeling"
          >
            <Smile className="h-[18px] w-[18px]" />
            Feeling
          </Button>
        </div>

        {/* Post button */}
        <Button
          size="default"
          className={cn(
            "rounded-full gap-2 transition-all font-bold text-sm px-6 h-10 shadow-sm",
            !isFilled && "opacity-50",
          )}
          onClick={handlePost}
          disabled={!isFilled}
          aria-label="Post"
        >
          Post
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
