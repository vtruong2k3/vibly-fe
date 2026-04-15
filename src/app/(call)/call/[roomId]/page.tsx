"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CallRoomShell } from "@/features/calls/components/call-room-shell";
import { useCallSession } from "@/hooks/use-calls";
import { useMe } from "@/hooks/use-users";

// ─── Call Page — Client Component ────────────────────────────────────────────
// Resolves call session from backend, then hands off to LiveKit shell
export default function CallPage() {
  const params = useParams<{ roomId: string }>();
  const callId = params.roomId;

  const { data: session, isLoading: sessionLoading } = useCallSession(callId);
  const { data: me, isLoading: meLoading } = useMe();

  const isLoading = sessionLoading || meLoading;

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Joining call…</p>
        </div>
      </div>
    );
  }

  const room = session
    ? {
        id: callId,
        name: session.name ?? "Call",
        startedAt: session.startedAt ?? new Date().toISOString(),
        callType: session.callType ?? "VIDEO",
        participants: session.participants ?? [],
      }
    : {
        id: callId,
        name: "Call",
        startedAt: new Date().toISOString(),
        callType: "VIDEO" as const,
        participants: [],
      };

  return (
    <CallRoomShell
      room={room}
      callId={callId}
      localParticipantId={me?.id ?? ""}
    />
  );
}
