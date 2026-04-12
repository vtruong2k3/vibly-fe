"use client";

import { useState } from "react";
import { MessageSquareDashed } from "lucide-react";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES_CONV1 } from "@/lib/mock-data/messages";
import { MOCK_CURRENT_USER } from "@/lib/mock-data/feed";
import { ConversationList } from "@/features/chat/components/conversation-list";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import type { Conversation, Message } from "@/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";


// ─── MessagesView — Client Component ─────────────────────────────
// Needs state: selectedConversationId
// Server data is passed in from the page (mock for now)
interface MessagesViewProps {
  conversations: Conversation[];
  initialMessages: Record<string, Message[]>;
}

export function MessagesView({ conversations, initialMessages }: MessagesViewProps) {
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const activeMessages = activeId ? (initialMessages[activeId] ?? []) : [];

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* ── Conversation List (Left Panel on Desktop / Full on Mobile) ── */}
      <div 
        className={cn(
          "w-full md:w-[340px] shrink-0 border-r border-border flex flex-col bg-slate-50/50 dark:bg-background transition-all duration-300",
          activeId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="px-5 py-4 border-b border-border/50 shrink-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <h1 className="text-xl md:text-[22px] font-bold font-heading text-slate-900 dark:text-white">Messages</h1>
        </div>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </div>

      {/* ── Chat Panel (Right Area on Desktop / Full on Mobile) ── */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 bg-background",
          !activeId ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversation ? (
          <ChatPanel
            conversation={activeConversation}
            messages={activeMessages}
            currentUserId={MOCK_CURRENT_USER.id}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 h-full">
            <EmptyState 
              icon={<MessageSquareDashed className="h-8 w-8" />}
              headline="Chưa có cuộc trò chuyện nào"
              description="Chọn một cuộc trò chuyện từ danh sách hoặc bắt đầu nhắn tin mới."
            />
          </div>
        )}
      </div>
    </div>
  );
}
