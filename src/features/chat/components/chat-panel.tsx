"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Phone, Video, MoreHorizontal, Smile, Loader2 } from "lucide-react";
import { UserHeader } from "@/components/shared/user-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./chat-bubble";
import { cn } from "@/lib/utils";
import { useMessagesQuery, useSendMessage } from "@/hooks/use-conversations";
import type { Conversation } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChatPanelProps {
  conversation: Conversation;
  // eslint-disable-next-line react/no-unused-prop-types
  messages?: unknown[]; // kept for backwards compat — panel now self-fetches
  currentUserId: string;
  onBack?: () => void;
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────
export function ChatPanel({ conversation, currentUserId, onBack }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationId = conversation.id;

  const { data, isLoading } = useMessagesQuery(conversationId);
  const { mutate: send, isPending: isSending } = useSendMessage(conversationId);

  // Flatten paginated messages (newest last)
  const messages = data?.pages.flatMap((p) => p.messages).reverse() ?? [];

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = () => {
    if (!draft.trim() || isSending) return;
    send({ messageType: "TEXT", content: draft.trim() });
    setDraft("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-2 md:px-4 py-2 md:py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-1 md:gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 shrink-0 text-muted-foreground mr-1"
              onClick={onBack}
              aria-label="Back to conversations"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Button>
          )}
          <UserHeader
            user={conversation.participant}
            size="md"
            withLink={true}
            showOnlineBadge={false}
            subtitle={conversation.participant.isOnline ? "Active now" : "Offline"}
            className="flex-1 min-w-0"
          />
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-[--color-success]" aria-label="Voice call">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary" aria-label="Video call">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" aria-label="More options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Messages ── */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg as never}
              isMine={msg.senderId === currentUserId}
              displayName={conversation.participant.displayName}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* ── Input Bar (Liquid Glass) ── */}
      <div className="px-4 md:px-6 py-4 bg-transparent shrink-0">
        <div className="flex items-end gap-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-2 rounded-[32px] border border-white/40 dark:border-white/10 focus-within:border-primary/40 focus-within:ring-[3px] focus-within:ring-primary/10 transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-500 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 shrink-0 transition-colors" aria-label="Add emoji">
            <Smile className="h-6 w-6" />
          </Button>

          <Input
            id="chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 min-h-[40px] px-3 py-2 text-[15px] resize-none placeholder:text-slate-500/80 dark:placeholder:text-slate-400"
            autoComplete="off"
          />

          <Button
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shrink-0 transition-all duration-300 shadow-md group disabled:shadow-none disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400",
              draft.trim()
                ? "bg-gradient-to-br from-primary to-blue-500 text-white shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95"
                : "",
            )}
            onClick={sendMessage}
            disabled={!draft.trim() || isSending}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className={cn("h-4 w-4", draft.trim() && "ml-0.5")} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
