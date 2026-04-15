"use client";

import { useState } from "react";
import { MessageSquareDashed, Loader2 } from "lucide-react";
import { ConversationList } from "@/features/chat/components/conversation-list";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { useConversationsQuery, useMarkConversationRead } from "@/hooks/use-conversations";
import { useMe } from "@/hooks/use-users";
import { cn } from "@/lib/utils";

// ─── MessagesView — Client Component ─────────────────────────────────────────
export function MessagesView() {
  const { data: conversationsData, isLoading } = useConversationsQuery();
  const { data: me } = useMe();
  const { mutate: markRead } = useMarkConversationRead();

  const conversations = conversationsData?.conversations ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setActiveId(id);
    markRead(id);
  };

  const activeConversation = conversations.find((c: { id: string }) => c.id === activeId) ?? null;

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* ── Conversation List ── */}
      <div
        className={cn(
          "w-full md:w-[340px] shrink-0 border-r border-border flex flex-col bg-slate-50/50 dark:bg-background transition-all duration-300",
          activeId ? "hidden md:flex" : "flex",
        )}
      >
        <div className="px-5 py-4 border-b border-border/50 shrink-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <h1 className="text-xl md:text-[22px] font-bold font-heading text-slate-900 dark:text-white">
            Messages
          </h1>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
          />
        )}
      </div>

      {/* ── Chat Panel ── */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 bg-background",
          !activeId ? "hidden md:flex" : "flex",
        )}
      >
        {activeConversation ? (
          <ChatPanel
            conversation={activeConversation}
            messages={[]}
            currentUserId={me?.id ?? ""}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 h-full">
            <EmptyState
              icon={<MessageSquareDashed className="h-8 w-8" />}
              headline="No conversation selected"
              description="Select a conversation from the list or start a new one."
            />
          </div>
        )}
      </div>
    </div>
  );
}
