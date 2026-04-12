"use client";

import { PhoneCall, Phone, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useCallStore } from "@/features/calls/stores/call.store";
import { MOCK_CALL_ROOM } from "@/lib/mock-data/calls";

export function IncomingCallModal() {
  const router = useRouter();
  const { isIncomingCallOpen, isReceivingCall, activeCallRoomId, setReceivingCall, setIncomingCallOpen, resetCallState } = useCallStore();

  if (!isIncomingCallOpen || !isReceivingCall) return null;

  // Placeholder caller data. 
  // In production, this would come from the signaling server event payload.
  const caller = MOCK_CALL_ROOM.participants.find(p => p.role === "host")?.user
    || MOCK_CALL_ROOM.participants[0].user;

  const handleAccept = () => {
    // Jump straight into the room
    const roomId = activeCallRoomId || MOCK_CALL_ROOM.id;
    setReceivingCall(false);
    setIncomingCallOpen(false);
    router.push(`/call/${roomId}`);
  };

  const handleDecline = () => {
    console.log("[IncomingCall] Declined");
    resetCallState();
  };

  return (
    <>
      {/* Backdrop overlay covering the whole screen for incoming ring */}
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in" />

      {/* Modal Box */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-[320px] animate-in zoom-in-95 duration-300">
        <div className="vibly-card overflow-hidden bg-[#111827] border-border/10 shadow-2xl p-6 flex flex-col items-center text-center">

          <div className="relative mb-6">
            <UserAvatar user={caller} size="xl" className="shadow-xl" />

            {/* Pulsing ring behind avatar */}
            <div className="absolute inset-0 rounded-full ring-2 ring-primary animate-ping opacity-75" />

            {/* Phone badge */}
            <div className="absolute -bottom-2 -right-2 bg-success text-white w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-[#111827]">
              <PhoneCall className="h-4 w-4 animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl font-heading font-semibold text-white mb-1">
            {caller.displayName}
          </h2>
          <p className="text-sm text-white/60 mb-8">
            Incoming video call...
          </p>

          <div className="flex items-center gap-6 w-full justify-center">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
                onClick={handleDecline}
                aria-label="Decline Call"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <span className="text-xs font-medium text-white/60">Decline</span>
            </div>

            {/* Accept Button */}
            <div className="flex flex-col items-center gap-2">
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-success hover:bg-success/90 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-105 transition-transform"
                onClick={handleAccept}
                aria-label="Accept Call"
              >
                <Phone className="h-6 w-6 text-white" />
              </Button>
              <span className="text-xs font-medium text-white/60">Accept</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
