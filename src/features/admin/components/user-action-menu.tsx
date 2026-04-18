"use client";

import { useState } from "react";
import { MoreHorizontal, CheckCircle, ShieldOff, Ban, RotateCcw } from "lucide-react";
import type { AdminUserListItem, UserStatus } from "@/types/admin.types";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import adminUsersService from "@/lib/services/admin-users.service";
import ConfirmWithReasonDialog from "./confirm-with-reason-dialog";
import { cn } from "@/lib/utils";

type ActionKey = "SUSPEND" | "BAN" | "ACTIVATE";

interface ActionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: ActionKey;
  destructive: boolean;
  adminOnly?: boolean;
  /** Return true to hide this action for the given user */
  hidden?: (user: AdminUserListItem) => boolean;
}

const ACTIONS: ActionConfig[] = [
  {
    label: "Activate",
    icon: CheckCircle,
    action: "ACTIVATE",
    destructive: false,
    hidden: (u) => u.status === "ACTIVE",
  },
  {
    label: "Suspend",
    icon: ShieldOff,
    action: "SUSPEND",
    destructive: true,
    hidden: (u) => u.status === "SUSPENDED" || u.status === "BANNED",
  },
  {
    label: "Ban permanently",
    icon: Ban,
    action: "BAN",
    destructive: true,
    adminOnly: true,
    hidden: (u) => u.status === "BANNED",
  },
];

const ACTION_LABELS: Record<ActionKey, string> = {
  ACTIVATE: "Restore this user's access?",
  SUSPEND:  "Suspend this user?",
  BAN:      "Ban this user permanently?",
};

const ACTION_DESCRIPTIONS: Record<ActionKey, string> = {
  ACTIVATE: "User's account will be re-activated. They will need to log in again.",
  SUSPEND:  "User will be force-logged out and blocked temporarily. All sessions revoked immediately.",
  BAN:      "Permanent ban. All sessions revoked, WebSocket force-disconnected. Reason is logged and auditable.",
};

interface Props {
  user: AdminUserListItem;
  onActionComplete: () => void;
}

export default function UserActionMenu({ user, onActionComplete }: Props) {
  const { hasPermission } = useAdminAuthStore();
  const [open, setOpen]               = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionKey | null>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const visibleActions = ACTIONS.filter((a) => {
    if (a.adminOnly && !hasPermission("ADMIN")) return false;
    if (a.hidden?.(user)) return false;
    return true;
  });

  const handleConfirm = async (reason: string) => {
    if (!pendingAction) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const targetStatus: UserStatus =
        pendingAction === "ACTIVATE" ? "ACTIVE" :
        pendingAction === "SUSPEND"  ? "SUSPENDED" : "BANNED";

      await adminUsersService.updateStatus(user.id, targetStatus, reason || undefined);
      setPendingAction(null);
      onActionComplete();
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message ?? "Action failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (visibleActions.length === 0) return null;

  return (
    <>
      <div className="relative">
        <button
          aria-label="User actions"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          className="p-1.5 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <MoreHorizontal className="size-4" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-8 z-20 w-44 rounded-xl bg-[#0D1526] border border-white/10 shadow-xl overflow-hidden">
              {visibleActions.map(({ label, icon: Icon, action, destructive }) => (
                <button
                  key={action}
                  onClick={() => { setPendingAction(action); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left",
                    destructive
                      ? "text-red-400 hover:bg-red-500/10"
                      : "text-slate-300 hover:bg-white/5",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirm dialog */}
      {pendingAction && (
        <ConfirmWithReasonDialog
          open
          title={ACTION_LABELS[pendingAction]}
          description={ACTION_DESCRIPTIONS[pendingAction]}
          confirmLabel={
            pendingAction === "ACTIVATE" ? "Restore" :
            pendingAction === "SUSPEND"  ? "Suspend" : "Ban"
          }
          destructive={["SUSPEND", "BAN"].includes(pendingAction)}
          requireReason={["SUSPEND", "BAN"].includes(pendingAction)}
          isSubmitting={isSubmitting}
          serverError={error}
          onConfirm={handleConfirm}
          onClose={() => { setPendingAction(null); setError(null); }}
        />
      )}
    </>
  );
}
