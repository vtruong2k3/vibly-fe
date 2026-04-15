"use client";

import { useChatStore } from "@/store/chat.store";
import { ChatBubbleWindow } from "./chat-bubble-window";

// ─── ChatBubbleDock ───────────────────────────────────────────────────────────
// Renders all open chat bubble windows, stacked from the right edge.
// Mounts as a portal-like overlay in the main layout.

export function ChatBubbleDock() {
  const { openConversationIds } = useChatStore();

  if (openConversationIds.length === 0) return null;

  return (
    <>
      {openConversationIds.map((id, idx) => (
        <ChatBubbleWindow key={id} conversationId={id} index={idx} />
      ))}
    </>
  );
}
