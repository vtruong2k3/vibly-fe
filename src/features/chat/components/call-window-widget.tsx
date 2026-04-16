"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCallStore } from "@/store/call.store";
import { Button } from "@/components/ui/button";
import { PhoneOff, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEndCall } from "@/hooks/use-calls";

// ─── CallWindowWidget ─────────────────────────────────────────────────────────
// Shows a floating mini-bar when a call is active but user navigated away from
// the /call/[id] page. Provides a quick return-to-call and hang-up button.
export function CallWindowWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeCall, clearCallState } = useCallStore();
  const { mutate: endCall } = useEndCall();
  const [callDuration, setCallDuration] = useState(0);

  // Only show when there is an active call AND user is NOT already on the call page
  const isOnCallPage = pathname?.startsWith("/call/");
  const shouldShow = !!activeCall && !isOnCallPage;

  // Call Timer
  useEffect(() => {
    if (!shouldShow) {
      setCallDuration(0);
      return;
    }
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [shouldShow]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const h = Math.floor(m / 60);
    if (h > 0) {
      return `${h}:${(m % 60).toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleReturnToCall = () => {
    if (activeCall) {
      router.push(`/call/${activeCall.callSessionId}`);
    }
  };

  const handleEndCall = () => {
    if (!activeCall) return;
    endCall(activeCall.callSessionId);
    clearCallState();
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 shadow-2xl"
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold leading-tight truncate">
              {activeCall.calerDisplayName || activeCall.callerUsername}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {formatDuration(callDuration)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            onClick={handleReturnToCall}
            title="Quay lại cuộc gọi"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleEndCall}
            title="Kết thúc cuộc gọi"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
