import { cn } from "@/lib/utils";

interface Props {
  rows?: number;
  cols?: number;
}

export default function AdminTableSkeleton({ rows = 6, cols = 5 }: Props) {
  return (
    <div className="rounded-xl border border-white/5 overflow-hidden animate-pulse">
      <div className="bg-white/[0.03] h-10 border-b border-white/5" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.04]">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className={cn("h-4 rounded bg-white/5", c === 0 ? "w-8" : c === 1 ? "flex-1" : "w-16")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
