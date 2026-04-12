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
    <ScrollArea className="flex-1 bg-transparent">
      <div className="p-3 md:p-4 space-y-2">
        {conversations.map((conv) => {
          const isActive = conv.id === activeId;
          const timeAgo = conv.lastMessage
            ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                addSuffix: false,
              }).replace('about ', '').replace(' hours', 'h').replace(' minutes', 'm').replace(' days', 'd').replace(' months', 'mo')
            : "";

          return (
            <button
              key={conv.id}
              id={`conversation-${conv.id}`}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full min-w-0 overflow-hidden flex items-center gap-3.5 px-3.5 py-3 rounded-[20px] text-left transition-all duration-300 relative group",
                isActive
                  ? "bg-white dark:bg-slate-800 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] ring-1 ring-border/30"
                  : "hover:bg-white/50 dark:hover:bg-slate-800/50 hover:shadow-sm ring-1 ring-transparent",
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <UserAvatar
                user={conv.participant}
                size="lg"
                isOnline={conv.participant.isOnline}
                className="shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-3 min-w-0 w-full">
                  <span className={cn(
                    "text-[15px] truncate flex-1 min-w-0",
                    isActive ? "font-bold text-slate-900 dark:text-slate-100" : "font-semibold text-slate-800 dark:text-slate-200"
                  )}>
                    {conv.participant.displayName}
                  </span>
                  <span className={cn(
                    "text-[11px] shrink-0 font-medium uppercase tracking-wider",
                    isActive ? "text-slate-500 dark:text-slate-400" : "text-slate-400/80 dark:text-slate-500"
                  )}>
                    {timeAgo}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 min-w-0 w-full">
                  <p className={cn(
                    "text-[13.5px] truncate flex-1 min-w-0",
                    conv.unreadCount > 0 
                      ? "font-bold text-slate-900 dark:text-slate-100" 
                      : (isActive ? "text-primary italic font-medium" : "text-slate-500 dark:text-slate-400")
                  )}>
                    {conv.unreadCount > 0 ? "Sent a photo" : (conv.lastMessage?.content ?? "No messages yet")}
                  </p>
                  {conv.unreadCount > 0 && (
                    <Badge className="h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px] font-bold bg-primary text-white rounded-full shadow-sm shrink-0">
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
