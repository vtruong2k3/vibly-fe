"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { useLiveKitToken, useEndCall } from "@/hooks/use-calls";
import { useCallStore } from "@/store/call.store";
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
//
// End-call lifecycle (passive side, i.e. you did NOT click End):
//   BE emits call:ended → global-chat-provider.tsx handles it → router.push('/messages')
//   → <LiveKitRoom> unmounts → onDisconnected fires → isEndingRef=false → NO double endCall ✅
//
// End-call lifecycle (active side, you clicked End):
//   handleEndCall() → isEndingRef=true → endCall() → onSuccess → router.push('/messages')
//   → <LiveKitRoom> unmounts → onDisconnected fires → isEndingRef=true → skip ✅
export function CallRoomShell({ room, callId, localParticipantId }: CallRoomShellProps) {
  const router = useRouter();
  const { clearCallState } = useCallStore();
  const { data: tokenData, isLoading: isTokenLoading } = useLiveKitToken(callId);
  const { mutate: endCall } = useEndCall();

  // Guard flag — true only when THIS user actively clicked "End Call"
  // Prevents onDisconnected from triggering endCall when:
  //  - Remote party leaves (causing our room to close)
  //  - Component unmounts due to router.push from global-chat-provider
  const isEndingRef = useRef(false);

  const leaveCall = useCallback(() => {
    clearCallState();
    router.push("/messages");
  }, [clearCallState, router]);

  // Custom End Call button handler (the red phone button in CallControls)
  const handleEndCall = useCallback(() => {
    isEndingRef.current = true;
    endCall(callId, {
      onSuccess: leaveCall,
      onError: leaveCall,
    });
  }, [callId, endCall, leaveCall]);

  // LiveKit onDisconnected — fires on:
  //  ✅ User clicked SDK Leave button (built-in)
  //  ❌ Remote disconnect / room closed (we should NOT re-call endCall)
  //  ❌ Component unmount (redirect by global-chat-provider)
  //
  // Strategy: only call endCall if user clicked the SDK Leave button AND
  // isEndingRef is not already true (meaning custom button was used).
  const handleLiveKitDisconnected = useCallback(() => {
    if (isEndingRef.current) {
      // Custom end-call button already handling this — skip to avoid double call
      return;
    }
    // SDK Leave button was clicked (not our custom button)
    // We must notify the backend so the other party gets the call:ended event
    isEndingRef.current = true;
    endCall(callId, { onSuccess: leaveCall, onError: leaveCall });
  }, [callId, endCall, leaveCall]);

  // Redirect if token fetch failed or call is no longer active
  useEffect(() => {
    if (!isTokenLoading && !tokenData?.token) {
      router.push("/messages");
    }
  }, [isTokenLoading, tokenData, router]);

  // Reset guard on callId change
  useEffect(() => {
    isEndingRef.current = false;
  }, [callId]);

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
      onDisconnected={handleLiveKitDisconnected}
    >
      {/* Floating header */}
      <CallHeader room={room} />

      {/* Render audio output for ALL remote participants — critical for voice calls */}
      <RoomAudioRenderer />

      {/* LiveKit video/audio grid — hide the built-in Leave button since we have our own */}
      <div className="flex-1 pt-16 pb-24 overflow-hidden [&_.lk-disconnect-button]:hidden">
        <VideoConference />
      </div>

      {/* Custom controls overlay */}
      <CallControls onEndCall={handleEndCall} />
    </LiveKitRoom>
  );
}
