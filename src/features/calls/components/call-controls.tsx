"use client";

import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── CallControls ───────────────────────────────────────────────────
// Bottom control bar for the call: mic, camera, end, options.
// All state is local mock toggle — will connect to LiveKit API in production.

interface CallControlsProps {
  onEndCall?: () => void;
}

export function CallControls({ onEndCall }: CallControlsProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-3 pb-8">
      {/* Background pill */}
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
        
        {/* Mic Toggle */}
        <ControlButton
          isActive={isMicOn}
          onClick={() => setIsMicOn((p) => !p)}
          ariaLabel={isMicOn ? "Mute microphone" : "Unmute microphone"}
          activeIcon={<Mic className="h-5 w-5" />}
          inactiveIcon={<MicOff className="h-5 w-5" />}
        />

        {/* Camera Toggle */}
        <ControlButton
          isActive={isCameraOn}
          onClick={() => setIsCameraOn((p) => !p)}
          ariaLabel={isCameraOn ? "Turn off camera" : "Turn on camera"}
          activeIcon={<Video className="h-5 w-5" />}
          inactiveIcon={<VideoOff className="h-5 w-5" />}
        />

        {/* Divider */}
        <div className="h-8 w-px bg-white/20 mx-1" />

        {/* More options */}
        <button
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white"
          aria-label="More options"
          type="button"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>

        {/* End Call */}
        <button
          className="h-12 w-12 rounded-full bg-destructive hover:bg-destructive/80 transition-colors flex items-center justify-center text-white shadow-lg"
          aria-label="End call"
          type="button"
          onClick={onEndCall}
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ─── ControlButton ──────────────────────────────────────────────────
// Reusable toggle button for individual call controls.

interface ControlButtonProps {
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
}

function ControlButton({
  isActive,
  onClick,
  ariaLabel,
  activeIcon,
  inactiveIcon,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-150",
        isActive
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-white/5 text-white/40 hover:bg-white/10",
      )}
    >
      {isActive ? activeIcon : inactiveIcon}
    </button>
  );
}
