import type { Metadata } from "next";
import type { Message } from "@/types";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES_CONV1 } from "@/lib/mock-data/messages";
import { MessagesView } from "@/features/chat/components/messages-view";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your private conversations on Vibly.",
};

// ─── Messages Page — Server Component ────────────────────────────
// Pre-loads conversations + first conversation messages
// MessagesView (Client Component) handles the interactive state
export default function MessagesPage() {
  // In production: this would be fetched via server-side React Query / RSC fetch
  const initialMessages: Record<string, Message[]> = {
    conv1: MOCK_MESSAGES_CONV1,
  };

  return (
    <div className="h-full">
      <MessagesView
        conversations={MOCK_CONVERSATIONS}
        initialMessages={initialMessages}
      />
    </div>
  );
}
