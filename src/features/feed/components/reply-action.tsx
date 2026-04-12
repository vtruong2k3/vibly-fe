import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

interface ReplyActionProps {
  replyToUser: User | null;
  onCancelReply: () => void;
}

// ─── ReplyAction ───────────────────────────────────────────────────
// An indicator banner displayed above the comment input when replying
// to a specific user. Displays "Replying to @username" with a cancel button.

export function ReplyAction({ replyToUser, onCancelReply }: ReplyActionProps) {
  if (!replyToUser) return null;

  return (
    <div className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-t-xl px-3 py-1.5 -mb-2 z-0">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        Replying to <span className="font-semibold text-foreground">@{replyToUser.username}</span>
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 rounded-full hover:bg-muted text-muted-foreground"
        onClick={onCancelReply}
        aria-label="Cancel reply"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
