import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CallRoomShell } from "@/features/calls/components/call-room-shell";
import { MOCK_CALL_ROOM } from "@/lib/mock-data/calls";
import { MOCK_CURRENT_USER } from "@/lib/mock-data/feed";

// ─── Params ───────────────────────────────────────────────────────
type CallPageProps = {
  params: Promise<{ roomId: string }>;
};

// ─── Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: CallPageProps): Promise<Metadata> {
  const { roomId } = await params;
  return {
    title: `Call — ${roomId} | Vibly`,
    description: "Vibly video call in progress.",
  };
}

// ─── Page ─────────────────────────────────────────────────────────
// Server Component: resolves room data, delegates UI to client shell.
export default async function CallPage({ params }: CallPageProps) {
  const { roomId } = await params;

  // Mock routing: only "room_dev_001" is available in static phase
  if (roomId !== MOCK_CALL_ROOM.id) {
    notFound();
  }

  return (
    <CallRoomShell
      room={MOCK_CALL_ROOM}
      localParticipantId={MOCK_CURRENT_USER.id}
    />
  );
}
