"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useLiveKitToken, useEndCall } from "@/hooks/use-calls";
import { CallControls } from "./call-controls";
import { CallHeader } from "./call-header";
import type { CallRoom } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface CallRoomShellProps {
  room: CallRoom;
  callId: string;
  localParticipantId: string;
}

// ─── CallRoomShell — LiveKit-powered call room ────────────────────────────────
// Fetches a LiveKit token from backend, then mounts <LiveKitRoom> provider.
export function CallRoomShell({ room, callId, localParticipantId }: CallRoomShellProps) {
  const router = useRouter();
  const { data: tokenData, isLoading: isTokenLoading } = useLiveKitToken(callId);
  const { mutate: endCall } = useEndCall();

  const handleEndCall = () => {
    endCall(callId, {
      onSuccess: () => router.push("/messages"),
      onError: () => router.push("/messages"),
    });
  };

  // Redirect if token fetch failed
  useEffect(() => {
    if (!isTokenLoading && !tokenData?.token) {
      router.push("/messages");
    }
  }, [isTokenLoading, tokenData, router]);

  if (isTokenLoading || !tokenData?.token) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Connecting to call…</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={tokenData.token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "wss://localhost:7880"}
      connect={true}
      video={room.callType === "VIDEO"}
      audio={true}
      className="relative h-full w-full flex flex-col"
      data-lk-theme="default"
    >
      {/* Floating header */}
      <CallHeader room={room} />

      {/* LiveKit default video/audio grid */}
      <div className="flex-1 pt-16 pb-24 overflow-hidden">
        <VideoConference />
      </div>

      {/* Custom controls overlay */}
      <CallControls onEndCall={handleEndCall} />
    </LiveKitRoom>
  );
}
