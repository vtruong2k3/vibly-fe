"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Phone, Video, MoreHorizontal, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserHeader } from "@/components/shared/user-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./chat-bubble";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/types";

// ─── Props ────────────────────────────────────────────────────────
interface ChatPanelProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onBack?: () => void;
}

// ─── ChatPanel ────────────────────────────────────────────────────
// Client Component: requires input state and scroll management
export function ChatPanel({
  conversation,
  messages: initialMessages,
  currentUserId,
  onBack,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!draft.trim()) return;
    const newMsg: Message = {
      id: `mock-${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUserId,
      content: draft.trim(),
      status: "sending",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
    // TODO: Replace with Socket.IO emit when realtime is connected
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-[--color-success]"
            aria-label="Voice call"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
            aria-label="Video call"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Messages ── */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === currentUserId}
              displayName={conversation.participant.displayName}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* ── Input Bar ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-accent shrink-0"
          aria-label="Add emoji"
        >
          <Smile className="h-5 w-5" />
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
          placeholder="Write a message..."
          className="flex-1 rounded-xl h-10 bg-muted border-transparent dark:border-border/60 focus-visible:ring-primary text-sm"
          autoComplete="off"
        />

        <Button
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl shrink-0 transition-all",
            !draft.trim() && "opacity-50",
          )}
          onClick={sendMessage}
          disabled={!draft.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
