import { MicOff, VideoOff, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CallParticipant } from "@/types";

// ─── ParticipantTile ────────────────────────────────────────────────
// Renders a single call participant's video tile.
// When camera is off, shows avatar. When speaking, adds ring highlight.
// Placeholder: will eventually bind to LiveKit TrackReference.

interface ParticipantTileProps {
  participant: CallParticipant;
  isLarge?: boolean;
}

export function ParticipantTile({
  participant,
  isLarge = false,
}: ParticipantTileProps) {
  const { user, isCameraActive, isMicActive, isSpeaking } = participant;

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden bg-[#111827] flex items-center justify-center",
        "transition-all duration-200",
        isSpeaking && "ring-2 ring-primary ring-offset-2 ring-offset-[#0a0f1a]",
        isLarge ? "aspect-video" : "aspect-video",
      )}
    >
      {/* ── Video area / Camera placeholder ── */}
      {isCameraActive ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2540] to-[#111827]">
          {/* Placeholder: In production, render <VideoTrack /> from LiveKit here */}
          <div className="flex flex-col items-center gap-2 text-white/30">
            <div className="h-16 w-24 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-xs font-mono">VIDEO</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Avatar className={cn("ring-4 ring-white/10", isLarge ? "h-24 w-24" : "h-16 w-16")}>
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
            <AvatarFallback className="bg-[#1e2d4a] text-white text-xl font-bold">
              {user.displayName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* ── Name tag overlay ── */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white truncate">
            {user.displayName}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isSpeaking && (
              <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
            )}
            {!isMicActive && (
              <div className="h-5 w-5 rounded-full bg-destructive/90 flex items-center justify-center">
                <MicOff className="h-3 w-3 text-white" />
              </div>
            )}
            {!isCameraActive && (
              <div className="h-5 w-5 rounded-full bg-black/60 flex items-center justify-center">
                <VideoOff className="h-3 w-3 text-white/60" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
