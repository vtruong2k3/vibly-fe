import type { Metadata } from "next";
import { MessagesView } from "@/features/chat/components/messages-view";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your private conversations on Vibly.",
};

// ─── Messages Page — Server Component ────────────────────────────────────────
// MessagesView is now a self-contained Client Component that fetches its own data
export default function MessagesPage() {
  return (
    <div className="h-full">
      <MessagesView />
    </div>
  );
}
