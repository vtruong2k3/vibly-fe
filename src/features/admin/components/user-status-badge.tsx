import type { UserStatus } from "@/types/admin.types";
import { cn } from "@/lib/utils";

const CONFIG: Record<UserStatus, { label: string; classes: string }> = {
  ACTIVE:    { label: "Active",    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  SUSPENDED: { label: "Suspended", classes: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  BANNED:    { label: "Banned",    classes: "bg-red-500/10 text-red-400 border-red-500/20" },
  DELETED:   { label: "Deleted",   classes: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
};

export default function UserStatusBadge({ status }: { status: UserStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.ACTIVE;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", cfg.classes)}>
      {cfg.label}
    </span>
  );
}
