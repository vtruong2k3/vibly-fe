"use client";

import { useState, useMemo } from "react";
import { MessageSquareDashed, Loader2 } from "lucide-react";
import { ConversationList } from "@/features/chat/components/conversation-list";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useConversationsQuery, useMarkConversationRead } from "@/hooks/use-conversations";
import { useMe } from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

// ─── MessagesView — Client Component ─────────────────────────────────────────
export function MessagesView() {
  const { data: conversationsData, isLoading } = useConversationsQuery();
  const { data: me } = useMe();
  const { mutate: markRead } = useMarkConversationRead();

  const conversationsArray = Array.isArray(conversationsData)
    ? conversationsData
    : (conversationsData as any)?.data ?? (conversationsData as any)?.conversations ?? [];
  const conversations = conversationsArray as Conversation[];
  const [activeId, setActiveId] = useState<string | null>(null);

  // Divide into Inbox & Requests
  const inboxConversations = useMemo(
    () => conversations.filter((c) => !c.isRequest),
    [conversations]
  );
  const requestConversations = useMemo(
    () => conversations.filter((c) => c.isRequest),
    [conversations]
  );

  const handleSelect = (id: string) => {
    setActiveId(id);
    markRead(id);
  };

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
      {/* ── Conversation List ── */}
      <div
        className={cn(
          "w-full md:w-[340px] shrink-0 border-r border-border flex flex-col bg-slate-50/50 dark:bg-background transition-all duration-300",
          activeId ? "hidden md:flex" : "flex",
        )}
      >
        <div className="px-5 py-4 border-b border-border/50 shrink-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-col gap-4">
          <h1 className="text-xl md:text-[22px] font-bold font-heading text-slate-900 dark:text-white">
            Đoạn chat
          </h1>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="inbox" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 pt-2 pb-1 bg-white/40 dark:bg-slate-900/40 shrink-0">
              <TabsList className="w-full">
                <TabsTrigger value="inbox" className="flex-1">
                  Chính thức
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex-1">
                  Tin nhắn chờ
                  {requestConversations.some(c => c.unreadCount > 0) && (
                    <span className="ml-1.5 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="inbox" className="flex-1 mt-0 overflow-hidden outline-none data-[state=active]:flex flex-col">
              {inboxConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 h-full text-muted-foreground text-sm">
                  Không có đoạn chat nào.
                </div>
              ) : (
                <ConversationList
                  conversations={inboxConversations}
                  activeId={activeId}
                  onSelect={handleSelect}
                />
              )}
            </TabsContent>

            <TabsContent value="requests" className="flex-1 mt-0 overflow-hidden outline-none data-[state=active]:flex flex-col">
              {requestConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 h-full text-muted-foreground text-sm">
                  Không có tin nhắn chờ nào.
                </div>
              ) : (
                <ConversationList
                  conversations={requestConversations}
                  activeId={activeId}
                  onSelect={handleSelect}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* ── Chat Panel ── */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden transition-all duration-300 bg-background",
          !activeId ? "hidden md:flex" : "flex",
        )}
      >
        {activeConversation ? (
          <ChatPanel
            conversation={activeConversation}
            currentUserId={me?.id ?? ""}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 h-full">
            <EmptyState
              icon={<MessageSquareDashed className="h-8 w-8" />}
              headline="Chưa chọn đoạn chat"
              description="Hãy chọn một đoạn chat hoặc tin nhắn chờ bên cạnh để tiếp tục."
            />
          </div>
        )}
      </div>
    </div>
  );
}

