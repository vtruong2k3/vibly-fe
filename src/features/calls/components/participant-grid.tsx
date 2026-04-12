import { cn } from "@/lib/utils";
import { ParticipantTile } from "./participant-tile";
import type { CallParticipant } from "@/types";

// ─── ParticipantGrid ────────────────────────────────────────────────
// Responsive grid layout for call participants.
// Layout adapts: 1→full, 2→side-by-side, 3-4→2x2.
// In production, will replace mock array with LiveKit participants hook.

interface ParticipantGridProps {
  participants: CallParticipant[];
  localParticipantId: string;
}

export function ParticipantGrid({
  participants,
  localParticipantId,
}: ParticipantGridProps) {
  const count = participants.length;

  const gridClass = cn(
    "w-full h-full grid gap-2 p-2",
    count === 1 && "grid-cols-1",
    count === 2 && "grid-cols-2",
    count >= 3 && "grid-cols-2",
  );

  return (
    <div className={gridClass}>
      {participants.map((participant) => (
        <ParticipantTile
          key={participant.id}
          participant={participant}
          isLarge={count <= 2}
        />
      ))}
    </div>
  );
}
