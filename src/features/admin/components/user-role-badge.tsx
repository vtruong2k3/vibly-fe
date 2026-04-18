import type { UserRole } from "@/types/admin.types";
import { cn } from "@/lib/utils";

const CONFIG: Record<UserRole, { label: string; classes: string }> = {
  USER:      { label: "User",      classes: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  MODERATOR: { label: "Moderator", classes: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  ADMIN:     { label: "Admin",     classes: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

export default function UserRoleBadge({ role }: { role: UserRole }) {
  const { label, classes } = CONFIG[role];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", classes)}>
      {label}
    </span>
  );
}
