"use client";

import { useEffect, useRef, useState } from "react";
import { useCallStore } from "@/store/call.store";
import { useWebRTC } from "@/hooks/use-webrtc";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEndCall } from "@/hooks/use-calls";

export function CallWindowWidget() {
  const {
    activeCall,
    isMuted,
    isVideoOff,
    localStream,
    remoteStream,
    isCallMinimized,
    minimizeCall,
    toggleMute,
    toggleVideo,
    clearCallState,
  } = useCallStore();

  const { closePeerConnection } = useWebRTC();
  const { mutate: endCall } = useEndCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [callDuration, setCallDuration] = useState(0);

  // Call Timer
  useEffect(() => {
    if (!activeCall || !remoteStream) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall, remoteStream]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const h = Math.floor(m / 60);
    if (h > 0) {
      return `${h}:${(m % 60).toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    if (!activeCall) return;
    endCall(activeCall.callSessionId);
    closePeerConnection();
    clearCallState();
  };

  // Reset timer on unmount
  useEffect(() => {
    if (!activeCall) {
      setCallDuration(0);
    }
  }, [activeCall]);

  if (!activeCall) return null;

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          width: isCallMinimized ? 240 : 400,
          height: isCallMinimized ? 340 : 560, // approx ratio
        }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="fixed bottom-6 right-6 z-[100] bg-background/95 backdrop-blur shadow-2xl border rounded-2xl overflow-hidden flex flex-col"
      >
        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 p-3 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-center text-white">
          <div className="flex items-center gap-2 max-w-[70%]">
            <span className="font-medium text-sm truncate drop-shadow-md">
              {activeCall.calerDisplayName || activeCall.callerUsername}
            </span>
            <span className="text-xs bg-red-500/80 px-2 py-0.5 rounded-full shadow-sm font-mono tracking-wider">
              {formatDuration(callDuration)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-white hover:bg-white/20"
            onClick={() => minimizeCall(!isCallMinimized)}
          >
            {isCallMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-neutral-900 overflow-hidden">
          {/* Main Remote Video (or empty state) */}
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover transition-all"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
              Waiting for peer...
            </div>
          )}

          {/* Local Video PIP */}
          {localStream && !isVideoOff && (
            <div className="absolute bottom-4 right-4 w-28 h-40 bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-lg z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted // ALWAYS MUTED LOCALLY
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <motion.div
          layout
          className="bg-card p-4 border-t flex items-center justify-center gap-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"
        >
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={toggleVideo}
            disabled={activeCall.callType === "AUDIO"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg ml-2 hover:bg-red-600 transition-colors"
            onClick={handleEndCall}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
