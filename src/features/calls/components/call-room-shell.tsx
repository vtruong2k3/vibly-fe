"use client";

import { useRouter } from "next/navigation";
import { CallHeader } from "./call-header";
import { ParticipantGrid } from "./participant-grid";
import { CallControls } from "./call-controls";
import type { CallRoom } from "@/types";

// ─── CallRoomShell ───────────────────────────────────────────────────
// Top-level client wrapper for the call interface.
// Composes Header + Grid + Controls.
// Placeholder: In production, this will wrap LiveKit <LiveKitRoom> provider.

interface CallRoomShellProps {
  room: CallRoom;
  localParticipantId: string;
}

export function CallRoomShell({ room, localParticipantId }: CallRoomShellProps) {
  const router = useRouter();

  const handleEndCall = () => {
    // Placeholder: will disconnect LiveKit room then navigate away
    console.log("[CallRoomShell] End call:", room.id);
    router.push("/messages");
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Floating header */}
      <CallHeader room={room} />

      {/* Main participant grid — fills available space */}
      <div className="flex-1 pt-16 pb-24">
        <ParticipantGrid
          participants={room.participants}
          localParticipantId={localParticipantId}
        />
      </div>

      {/* Floating controls */}
      <CallControls onEndCall={handleEndCall} />
    </div>
  );
}
