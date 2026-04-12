import { formatDistanceToNow } from "date-fns";
import { Users } from "lucide-react";
import type { CallRoom } from "@/types";

// ─── CallHeader ─────────────────────────────────────────────────────
// Top bar for the call screen: room name, elapsed time, participant count.

interface CallHeaderProps {
  room: CallRoom;
}

export function CallHeader({ room }: CallHeaderProps) {
  const elapsed = formatDistanceToNow(new Date(room.startedAt));

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
      {/* Left: Room name + elapsed time */}
      <div className="flex flex-col">
        <h1 className="text-base font-semibold text-white leading-tight">
          {room.name}
        </h1>
        <p className="text-xs text-white/50 mt-0.5">{elapsed}</p>
      </div>

      {/* Right: Participant count badge */}
      <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <Users className="h-3.5 w-3.5 text-white/70" />
        <span className="text-xs font-medium text-white/80">
          {room.participants.length}
        </span>
      </div>
    </header>
  );
}
