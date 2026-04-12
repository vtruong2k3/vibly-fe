"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── ReactionButton ────────────────────────────────────────────────
// A reusable icon+count button used in post action rows.
// Supports active state (e.g., liked), custom hover color, and aria labels.

interface ReactionButtonProps {
  icon: React.ReactNode;
  count: number;
  isActive?: boolean;
  activeClass?: string;
  hoverClass?: string;
  ariaLabel: string;
  ariaPressed?: boolean;
  onClick?: () => void;
}

export function ReactionButton({
  icon,
  count,
  isActive = false,
  activeClass = "text-destructive hover:text-destructive bg-destructive/10",
  hoverClass = "hover:text-muted-foreground hover:bg-muted/60",
  ariaLabel,
  ariaPressed,
  onClick,
}: ReactionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "gap-2 rounded-full text-[13px] h-9 px-3 font-semibold transition-colors",
        isActive ? activeClass : cn("text-muted-foreground", hoverClass),
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
    >
      {icon}
      <span>{count > 0 ? count : ""}</span>
    </Button>
  );
}

// ─── Convenience exports for common reactions ──────────────────────

interface LikeButtonProps {
  likeCount: number;
  isLiked: boolean;
  onClick: () => void;
}

export function LikeButton({ likeCount, isLiked, onClick }: LikeButtonProps) {
  return (
    <ReactionButton
      icon={<Heart className={cn("h-[18px] w-[18px]", isLiked && "fill-current")} />}
      count={likeCount}
      isActive={isLiked}
      activeClass="text-destructive hover:text-destructive bg-destructive/10"
      hoverClass="hover:text-destructive hover:bg-destructive/10"
      ariaLabel={isLiked ? "Unlike post" : "Like post"}
      ariaPressed={isLiked}
      onClick={onClick}
    />
  );
}

interface CommentButtonProps {
  commentCount: number;
  onClick?: () => void;
}

export function CommentButton({ commentCount, onClick }: CommentButtonProps) {
  return (
    <ReactionButton
      icon={<MessageCircle className="h-[18px] w-[18px]" />}
      count={commentCount}
      hoverClass="hover:text-primary hover:bg-primary/10"
      ariaLabel="Comment on post"
      onClick={onClick}
    />
  );
}

interface ShareButtonProps {
  shareCount: number;
  onClick?: () => void;
}

export function ShareButton({ shareCount, onClick }: ShareButtonProps) {
  return (
    <ReactionButton
      icon={<Share2 className="h-[18px] w-[18px]" />}
      count={shareCount}
      hoverClass="hover:text-accent hover:bg-accent/10"
      ariaLabel="Share post"
      onClick={onClick}
    />
  );
}
