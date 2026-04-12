import { MicOff, VideoOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── DeviceStatusIndicators ───────────────────────────────────────
// Reusable component to display mic and camera off status, or speaking state.
// Used in participant tiles, floating dock, or lobby settings.

interface DeviceStatusIndicatorsProps {
  isMicActive: boolean;
  isCameraActive: boolean;
  isSpeaking?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function DeviceStatusIndicators({
  isMicActive,
  isCameraActive,
  isSpeaking = false,
  className,
  size = "md",
}: DeviceStatusIndicatorsProps) {
  const iconSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
  const containerSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  if (isMicActive && isCameraActive && !isSpeaking) return null;

  return (
    <div className={cn("flex items-center gap-1.5 shrink-0", className)}>
      {isSpeaking && (
        <Volume2 className={cn("text-primary animate-pulse", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      )}
      {!isMicActive && (
        <div className={cn("rounded-full bg-destructive/90 flex items-center justify-center", containerSize)}>
          <MicOff className={cn("text-white", iconSize)} />
        </div>
      )}
      {!isCameraActive && (
        <div className={cn("rounded-full bg-black/60 flex items-center justify-center", containerSize)}>
          <VideoOff className={cn("text-white/60", iconSize)} />
        </div>
      )}
    </div>
  );
}
