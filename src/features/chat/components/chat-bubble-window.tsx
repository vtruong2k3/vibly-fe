"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Minus, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat.store";
import { useConversationMessages, useSendMessage, useConversations } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/auth.store";
import { useSocket } from "@/providers/socket-provider";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RawMessage {
  id: string;
  content: string;
  senderUserId: string;
  sentAt: string;
}

// ─── ChatBubbleWindow ─────────────────────────────────────────────────────────
interface ChatBubbleWindowProps {
  conversationId: string;
  index: number; // position from right (0 = rightmost)
}

export function ChatBubbleWindow({ conversationId, index }: ChatBubbleWindowProps) {
  const me = useAuthStore((s) => s.user);
  const { closeConversation, minimizedIds, toggleMinimize } = useChatStore();
  const isMinimized = minimizedIds.has(conversationId);

  const { data: conversations = [] } = useConversations();
  const convo = (conversations as Array<{ id: string; members?: Array<{ user: { id: string; username: string; profile?: { displayName: string; avatarMediaId: string | null } } }> }>)
    .find((c) => c.id === conversationId);

  // Find the other participant's info
  const otherMember = convo?.members?.find((m) => m.user.id !== me?.id);
  const otherUser = otherMember?.user;
  const displayName = otherUser?.profile?.displayName || otherUser?.username || "Chat";
  const avatarUrl = otherUser?.profile?.avatarMediaId || null;

  const { joinConversation, leaveConversation } = useSocket();

  // Join / leave socket room
  useEffect(() => {
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const { data: pages, isLoading } = useConversationMessages(isMinimized ? null : conversationId);
  const sendMessage = useSendMessage(conversationId);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Flatten infinite pages into a single list
  const messages: RawMessage[] = pages?.pages.flatMap((p) => p.data) ?? [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!isMinimized) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isMinimized]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate({ content: trimmed });
    setText("");
  }, [text, sendMessage]);

  // Right offset: each window is 320px + 8px gap, starting from 80px (above scrollbar)
  const rightOffset = 80 + index * 328;

  return (
    <div
      style={{ right: `${rightOffset}px` }}
      className="fixed bottom-0 z-50 w-[308px] flex flex-col shadow-2xl rounded-t-2xl overflow-hidden border border-border bg-card"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 bg-card border-b border-border cursor-pointer select-none"
        onClick={() => toggleMinimize(conversationId)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[13px] font-semibold truncate">{displayName}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); toggleMinimize(conversationId); }}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); closeConversation(conversationId); }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto p-3 h-[340px] scrollbar-thin">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">
                Hãy bắt đầu cuộc trò chuyện 👋
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderUserId === me?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn("flex", isMe ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed break-words",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-border">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Aa"
              rows={1}
              maxLength={2000}
              className="flex-1 resize-none rounded-full bg-muted/60 px-3.5 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:bg-muted/80 transition-colors"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 rounded-full text-primary hover:bg-primary/10 disabled:opacity-30"
              disabled={!text.trim() || sendMessage.isPending}
              onClick={handleSend}
            >
              {sendMessage.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
