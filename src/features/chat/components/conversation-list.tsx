"use client";

import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

// ─── Props ────────────────────────────────────────────────────────
interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

// ─── ConversationList ────────────────────────────────────────────
export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {conversations.map((conv) => {
          const isActive = conv.id === activeId;
          const timeAgo = conv.lastMessage
            ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                addSuffix: false,
              })
            : "";

          return (
            <button
              key={conv.id}
              id={`conversation-${conv.id}`}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-foreground"
                  : "hover:bg-muted text-foreground",
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <UserAvatar
                user={conv.participant}
                size="md"
                isOnline={conv.participant.isOnline}
                className="shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold truncate">
                    {conv.participant.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage?.content ?? "No messages yet"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <Badge className="h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground shrink-0">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
