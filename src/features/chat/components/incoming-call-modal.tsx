"use client";

import { useEffect, useRef } from "react";
import { useCallStore } from "@/store/call.store";
import { useWebRTC } from "@/hooks/use-webrtc";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneCall, PhoneOff, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRejectCall, useAcceptCall } from "@/hooks/use-calls";

export function IncomingCallModal() {
  const { incomingCall, clearCallState, setActiveCall } = useCallStore();
  const { answerCall } = useWebRTC();
  const { mutate: rejectCall } = useRejectCall();
  const { mutateAsync: acceptCallBackend } = useAcceptCall();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (incomingCall) {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/incoming-call.mp3");
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(e => console.error("Auto-play blocked:", e));
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [incomingCall]);

  const handleAccept = async () => {
    if (!incomingCall) return;
    if (audioRef.current) audioRef.current.pause();
    
    // Switch to active call screen immediately
    setActiveCall(incomingCall);

    try {
      // Notify backend we answered it so the timer can officially start
      await acceptCallBackend(incomingCall.callSessionId);

      // Create answer and emit SDP
      await answerCall(
        incomingCall.otherUserId,
        incomingCall.callType,
        incomingCall.callSessionId
      );
    } catch (err) {
       console.error("Failed to answer call:", err);
       clearCallState();
    }
  };

  const handleDecline = () => {
    if (!incomingCall) return;
    if (audioRef.current) audioRef.current.pause();
    // Hit backend
    rejectCall(incomingCall.callSessionId);
    clearCallState();
  };

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[340px] bg-card/90 backdrop-blur-xl border shadow-2xl rounded-3xl p-6"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                <AvatarImage src={incomingCall.callerAvatarUrl} />
                <AvatarFallback className="text-2xl">
                  {incomingCall.calerDisplayName?.[0] || incomingCall.callerUsername?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full animate-ping ring-4 ring-primary/40" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">
                {incomingCall.calerDisplayName || incomingCall.callerUsername}
              </h3>
              <p className="text-sm text-muted-foreground animate-pulse">
                Incoming {incomingCall.callType === "VIDEO" ? "Video" : "Audio"} Call...
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 w-full">
              <Button
                variant="destructive"
                size="icon"
                className="w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
                onClick={handleDecline}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="w-14 h-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600 hover:scale-105 transition-transform"
                onClick={handleAccept}
              >
                {incomingCall.callType === "VIDEO" ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <PhoneCall className="w-6 h-6 text-white" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
