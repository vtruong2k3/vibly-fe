"use client";

import { Maximize2, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { DeviceStatusIndicators } from "./device-status-indicators";
import { MOCK_CALL_ROOM } from "@/lib/mock-data/calls";
import { useCallStore } from "@/store/call.store";

export function FloatingCallDock() {
  const router = useRouter();
  const { isFloatingDockVisible, activeCallRoomId, minimizeCall, clearCallState } = useCallStore();

  if (!isFloatingDockVisible || !activeCallRoomId) return null;

  // For this phase, we use the MOCK_CALL_ROOM. 
  // In reality, you'd fetch the room info from a LiveKit context or backend state.
  const activeSpeaker = MOCK_CALL_ROOM.participants.find(p => p.isSpeaking)
    || MOCK_CALL_ROOM.participants.find(p => p.role === "guest")
    || MOCK_CALL_ROOM.participants[0];

  const handleExpand = () => {
    minimizeCall(false);
    router.push(`/call/${activeCallRoomId}`);
  };

  const handleEndCall = () => {
    clearCallState();
    console.log("[FloatingDock] Call ended");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="vibly-card overflow-hidden bg-[#111827]/95 backdrop-blur-lg border-white/10 shadow-2xl w-64 p-3 flex flex-col gap-3">

        {/* Header / Draggable Handle area (Simulated) */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-white">Tap to expand</span>
          </div>
          <button
            type="button"
            onClick={handleExpand}
            className="text-white/50 hover:text-white transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* User preview */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-primary">
              <AvatarImage src={activeSpeaker.user.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {activeSpeaker.user.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <DeviceStatusIndicators
              isMicActive={activeSpeaker.isMicActive}
              isCameraActive={activeSpeaker.isCameraActive}
              isSpeaking={activeSpeaker.isSpeaking}
              size="sm"
              className="absolute -bottom-1 -right-2 bg-[#111827] rounded-full px-0.5"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {activeSpeaker.user.displayName}
            </p>
            <p className="text-xs text-white/50 truncate">
              {MOCK_CALL_ROOM.name}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-1">
          <Button
            className="flex-1 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white border-none font-medium"
            variant="outline"
            onClick={handleExpand}
          >
            Expand
          </Button>
          <Button
            className="h-8 w-10 rounded-xl bg-destructive hover:bg-destructive/80 text-white shrink-0"
            size="icon"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
