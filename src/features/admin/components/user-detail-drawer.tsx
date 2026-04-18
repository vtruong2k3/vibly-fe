"use client";

import { useEffect } from "react";
import { X, ShieldCheck, ShieldX, Mail, MailCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AdminUserListItem } from "@/types/admin.types";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminUsersService from "@/lib/services/admin-users.service";
import UserStatusBadge from "./user-status-badge";
import UserRoleBadge from "./user-role-badge";
import UserActionMenu from "./user-action-menu";

interface Props {
  user: AdminUserListItem | null;
  onClose: () => void;
  onActionComplete: () => void;
}

export default function UserDetailDrawer({ user, onClose, onActionComplete }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { data: detail, isLoading } = useQuery({
    queryKey: ADMIN_QUERY_KEYS.user(user?.id ?? ""),
    queryFn: () => adminUsersService.getById(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });

  if (!user) return null;

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "—";

  const formatDateTime = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "Never";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`User detail: ${user.username}`}
        className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-[#0B1526] border-l border-white/5 shadow-2xl overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[#0B1526] z-10">
          <h2 className="text-sm font-semibold text-white">User Detail</h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 text-slate-500 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* User overview */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold text-white shrink-0">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white">{user.username}</p>
                <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
              </div>
            </div>
            <UserActionMenu
              user={user}
              onActionComplete={() => { onActionComplete(); onClose(); }}
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <UserRoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-px bg-white/5 border-b border-white/5">
          {[
            { label: "Posts",    value: user._count.posts.toLocaleString() },
            { label: "Reports",  value: user._count.reportsFiled.toLocaleString() },
            { label: "Joined",   value: formatDate(user.createdAt) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0B1526] px-5 py-4 text-center">
              <p className="text-base font-bold text-white tabular-nums">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Detail section */}
        <div className="flex-1 px-5 py-5 space-y-5">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[80, 60, 90].map((w) => (
                <div key={w} className="h-3 rounded bg-white/5" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : detail ? (
            <>
              {/* Account info */}
              <div className="space-y-3 text-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    {detail.emailVerifiedAt ? (
                      <MailCheck className="size-3.5 text-emerald-400" />
                    ) : (
                      <Mail className="size-3.5 text-slate-600" />
                    )}
                    <span className="text-xs">Email verified</span>
                  </div>
                  <span className={detail.emailVerifiedAt ? "text-xs text-emerald-400" : "text-xs text-slate-500"}>
                    {detail.emailVerifiedAt ? formatDate(detail.emailVerifiedAt) : "Not verified"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    {detail.totpEnabled ? (
                      <ShieldCheck className="size-3.5 text-emerald-400" />
                    ) : (
                      <ShieldX className="size-3.5 text-slate-600" />
                    )}
                    <span className="text-xs">2FA / TOTP</span>
                  </div>
                  <span className={detail.totpEnabled ? "text-xs text-emerald-400" : "text-xs text-slate-500"}>
                    {detail.totpEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Last login</span>
                  <span className="text-xs text-slate-300">{formatDateTime(user.lastLoginAt)}</span>
                </div>
              </div>

              {/* Moderation history */}
              {detail.moderationHistory.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Moderation History
                  </p>
                  <div className="space-y-2">
                    {detail.moderationHistory.map((log) => (
                      <div key={log.id} className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-300 font-mono">
                            {log.action}
                          </span>
                          <span className="text-xs text-slate-600">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                        {log.reason && (
                          <p className="text-xs text-slate-500 line-clamp-2">{log.reason}</p>
                        )}
                        {log.actor && (
                          <p className="text-xs text-slate-600 mt-1">
                            by <span className="text-slate-500">{log.actor.username}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.moderationHistory.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-4">No moderation history.</p>
              )}
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}
