"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { FriendRequest } from "@/types";

interface FriendRequestCardProps {
  request: FriendRequest;
  onActionComplete?: () => void;
}

export function FriendRequestCard({
  request,
  onActionComplete,
}: FriendRequestCardProps) {
  const [isHandled, setIsHandled] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(request.createdAt), {
    addSuffix: true,
  });

  const handleAction = (action: "accept" | "decline") => {
    // Make a visual exit animation before removing the card
    setIsHandled(true);
    console.log(`[Friend Request] ${action}: `, request.id);
    setTimeout(() => onActionComplete?.(), 300);
  };

  return (
    <AnimatePresence>
      {!isHandled && (
        <motion.div
          initial={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          className="vibly-card p-4 space-y-4 overflow-hidden origin-top"
        >
          <div className="flex items-start gap-4">
            <Link href={`/profile/${request.sender.username}`} className="shrink-0">
              <Avatar className="h-12 w-12 hover:opacity-80 transition-opacity">
                <AvatarImage src={request.sender.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {request.sender.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${request.sender.username}`}
                className="text-sm font-semibold text-foreground hover:underline"
              >
                {request.sender.displayName}
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                {request.sender.bio ?? `@${request.sender.username}`}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo}</p>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              className="flex-1 rounded-xl gap-2 font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleAction("accept")}
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl gap-2 font-medium border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => handleAction("decline")}
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
