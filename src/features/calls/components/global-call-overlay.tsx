"use client";

import { useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useLocalParticipant,
  useRemoteParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useLiveKitToken, useEndCall } from "@/hooks/use-calls";
import { useCallStore } from "@/store/call.store";
import { CallControls } from "@/features/calls/components/call-controls";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── GlobalCallOverlay ────────────────────────────────────────────────────────
// Mounts on top of any page route — no navigation needed.
// Listens to activeCall in store; renders the LiveKit room as either:
//   • Fullscreen (fixed inset-0 z-50) — default
//   • Picture-in-Picture (fixed bottom-4 right-4 w-80 h-48) — minimized
export function GlobalCallOverlay() {
  const { activeCall, isCallMinimized, minimizeCall, clearCallState } = useCallStore();

  if (!activeCall) return null;

  return (
    <CallOverlayInner
      callSessionId={activeCall.callSessionId}
      callType={activeCall.callType}
      callerUsername={activeCall.calerDisplayName || activeCall.callerUsername}
      isMinimized={isCallMinimized}
      onMinimize={() => minimizeCall(true)}
      onMaximize={() => minimizeCall(false)}
      onClearState={clearCallState}
    />
  );
}

// ─── CallOverlayInner ─────────────────────────────────────────────────────────
// Separated so we can conditionally call hooks without violating rules.
interface InnerProps {
  callSessionId: string;
  callType: "AUDIO" | "VIDEO";
  callerUsername: string;
  isMinimized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClearState: () => void;
}

function CallOverlayInner({
  callSessionId,
  callType,
  callerUsername,
  isMinimized,
  onMinimize,
  onMaximize,
  onClearState,
}: InnerProps) {
  const { data: tokenData, isLoading } = useLiveKitToken(callSessionId);
  const { mutate: endCall } = useEndCall();
  const isEndingRef = useRef(false);

  const leaveCall = useCallback(() => {
    onClearState();
  }, [onClearState]);

  const handleEndCall = useCallback(() => {
    isEndingRef.current = true;
    endCall(callSessionId, { onSuccess: leaveCall, onError: leaveCall });
  }, [callSessionId, endCall, leaveCall]);

  const handleLiveKitDisconnected = useCallback(() => {
    if (isEndingRef.current) return;
    // SDK Leave button clicked — notify backend
    isEndingRef.current = true;
    endCall(callSessionId, { onSuccess: leaveCall, onError: leaveCall });
  }, [callSessionId, endCall, leaveCall]);

  if (isLoading || !tokenData?.token) {
    return (
      <AnimatePresence>
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 shadow-2xl"
        >
          <Loader2 className="h-5 w-5 animate-spin text-white" />
          <span className="text-sm text-white/80">Đang kết nối cuộc gọi…</span>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="call-overlay"
        initial={isMinimized ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 0 }}
        animate={isMinimized ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed z-50 overflow-hidden shadow-2xl transition-all duration-300",
          isMinimized
            ? "bottom-6 right-6 w-80 h-52 rounded-2xl border border-white/10"
            : "inset-0 rounded-none",
        )}
      >
        <LiveKitRoom
          token={tokenData.token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "wss://localhost:7880"}
          connect={true}
          video={callType === "VIDEO"}
          audio={true}
          className="relative h-full w-full flex flex-col bg-[#0a0f1a]"
          data-lk-theme="default"
          onDisconnected={handleLiveKitDisconnected}
        >
          {/* Audio always active regardless of mode */}
          <RoomAudioRenderer />

          {isMinimized ? (
            // ── PIP Mode: compact view ─────────────────────────────────────────
            <PipView
              callType={callType}
              callerUsername={callerUsername}
              onMaximize={onMaximize}
              onEndCall={handleEndCall}
            />
          ) : (
            // ── Fullscreen Mode ────────────────────────────────────────────────
            <>
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{callerUsername}</span>
                  <span className="text-xs text-white/50">{callType === "VIDEO" ? "Video Call" : "Voice Call"}</span>
                </div>
                <button
                  onClick={onMinimize}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 text-xs text-white/80 hover:text-white transition-colors"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Thu nhỏ</span>
                </button>
              </div>

              {/* Video grid — hide LiveKit's own Leave button */}
              <div className="flex-1 pt-14 pb-24 overflow-hidden [&_.lk-disconnect-button]:hidden">
                <VideoConference />
              </div>

              {/* Custom controls */}
              <CallControls onEndCall={handleEndCall} />
            </>
          )}
        </LiveKitRoom>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── PipView ──────────────────────────────────────────────────────────────────
// Compact overlay shown in minimized (Picture-in-Picture) state.
function PipView({
  callType,
  callerUsername,
  onMaximize,
  onEndCall,
}: {
  callType: "AUDIO" | "VIDEO";
  callerUsername: string;
  onMaximize: () => void;
  onEndCall: () => void;
}) {
  const remoteParticipants = useRemoteParticipants();
  const { isMicrophoneEnabled } = useLocalParticipant();
  const remoteCount = remoteParticipants.length;

  return (
    <div className="relative h-full w-full flex flex-col bg-slate-900 text-white">
      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 p-3">
        <Avatar className="w-12 h-12 border-2 border-white/20">
          <AvatarFallback className="bg-slate-700 text-white text-lg">
            {callerUsername[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-sm font-semibold leading-tight">{callerUsername}</p>
          <p className="text-xs text-white/50 mt-0.5">
            {remoteCount > 0 ? "Đang kết nối" : "Đang chờ…"}
            {!isMicrophoneEnabled && " · Đã tắt mic"}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between px-3 pb-3 gap-2">
        {/* Maximize */}
        <button
          onClick={onMaximize}
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 text-xs text-white/80 hover:text-white transition-colors"
        >
          <Maximize2 className="h-3 w-3" />
          <span>Phóng to</span>
        </button>

        {/* End call button */}
        <button
          onClick={onEndCall}
          className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
          aria-label="End call"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
