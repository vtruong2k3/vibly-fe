"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, UserMinus, RefreshCw, Shield } from "lucide-react";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import type { AdminAccountListItem, AdminRole } from "@/types/admin.types";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminAccountsService from "@/lib/services/admin-accounts.service";
import { cn } from "@/lib/utils";
import AdminErrorState from "./admin-error-state";
import AdminTableSkeleton from "./admin-table-skeleton";
import ConfirmWithReasonDialog from "./confirm-with-reason-dialog";
import UserRoleBadge from "./user-role-badge";

// ─── Types ────────────────────────────────────────────────────────────────────
type ManageAction = "CHANGE_ROLE" | "DEACTIVATE";

// ─── RBAC Check ───────────────────────────────────────────────────────────────
function canActOn(actorRole: AdminRole, target: AdminAccountListItem, selfId: string): boolean {
  if (target.id === selfId) return false; // cannot act on self
  const RANK: Record<AdminRole, number> = { MODERATOR: 1, ADMIN: 2 };
  return RANK[actorRole as AdminRole] > RANK[target.role as AdminRole];
}

// ─── Row component ────────────────────────────────────────────────────────────
function AdminRow({
  account,
  selfId,
  selfRole,
  onAction,
}: {
  account: AdminAccountListItem;
  selfId: string;
  selfRole: AdminRole;
  onAction: (target: AdminAccountListItem, action: ManageAction) => void;
}) {
  const isSelf  = account.id === selfId;
  const allowed = canActOn(selfRole, account, selfId);

  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white shrink-0">
            {account.username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-white text-xs font-medium">{account.username}</p>
              {isSelf && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">
                  You
                </span>
              )}
            </div>
            <p className="text-slate-600 text-xs">{account.email}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <UserRoleBadge role={account.role as "USER" | "MODERATOR" | "ADMIN"} />
      </td>

      <td className="px-4 py-3">
        <span className={cn(
          "text-xs font-medium",
          account.status === "ACTIVE" ? "text-emerald-400" : "text-slate-500",
        )}>
          {account.status}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className={cn("size-2 rounded-full", account.totpEnabled ? "bg-emerald-400" : "bg-red-400")} />
          <span className="text-xs text-slate-500">{account.totpEnabled ? "Enabled" : "Not set"}</span>
        </div>
      </td>

      <td className="px-4 py-3 text-slate-600 text-xs">
        {account.lastLoginAt
          ? new Date(account.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
          : "—"}
      </td>

      <td className="px-4 py-3 text-right">
        {allowed && account.status === "ACTIVE" ? (
          <div className="flex justify-end gap-1">
            <button
              onClick={() => onAction(account, "CHANGE_ROLE")}
              title="Change role"
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <Shield className="size-3.5" />
            </button>
            <button
              onClick={() => onAction(account, "DEACTIVATE")}
              title="Deactivate"
              className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <UserMinus className="size-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-slate-700 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminRolesContent() {
  const { admin, hasPermission } = useAdminAuthStore();

  // Hard gate — this page is ADMIN-only
  if (!hasPermission("ADMIN")) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-10 text-center">
        <ShieldAlert className="size-6 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-400 font-medium">Access denied</p>
        <p className="text-xs text-red-400/60 mt-1">This page requires Admin role.</p>
      </div>
    );
  }

  const qc = useQueryClient();
  const [pendingAction, setPendingAction] = useState<{ target: AdminAccountListItem; action: ManageAction } | null>(null);

  const { data: rawData, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ADMIN_QUERY_KEYS.accounts,
    queryFn: () => adminAccountsService.list({ limit: 50 }),
    staleTime: 60_000,
  });

  const stats = useQuery({
    queryKey: ADMIN_QUERY_KEYS.accountStats,
    queryFn:  () => adminAccountsService.getStats(),
    staleTime: 60_000,
  });

  const mutateAction = useMutation({
    mutationFn: async ({ target, action, reason }: { target: AdminAccountListItem; action: ManageAction; reason: string }) => {
      if (action === "DEACTIVATE") {
        await adminAccountsService.updateStatus(target.id, "SUSPENDED", reason);
      } else if (action === "CHANGE_ROLE") {
        const newRole = target.role === "MODERATOR" ? "USER" : "MODERATOR";
        await adminAccountsService.updateRole(target.id, newRole);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.accounts });
      setPendingAction(null);
    },
  });

  const ACTION_CONFIG: Record<ManageAction, { title: string; description: string; destructive: boolean; label: string }> = {
    CHANGE_ROLE: {
      title:       "Change admin role",
      description: "This will change the account's access level immediately. The change is logged.",
      destructive: false,
      label:       "Change Role",
    },
    DEACTIVATE: {
      title:       "Deactivate admin account?",
      description: "This admin will be logged out and their sessions revoked immediately.",
      destructive: true,
      label:       "Deactivate",
    },
  };

  const admins = rawData?.data ?? [];
  const activeAdmins      = admins.filter((a) => a.status === "ACTIVE");
  const deactivatedAdmins = admins.filter((a) => a.status !== "ACTIVE");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Admins & Roles</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {stats.data ? `${stats.data.totalAdmins} admin${stats.data.totalAdmins !== 1 ? "s" : ""}, ${stats.data.totalMods} mod${stats.data.totalMods !== 1 ? "s" : ""}` : `${activeAdmins.length} active`}
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* RBAC notice */}
      <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 px-4 py-3 flex items-start gap-2.5">
        <ShieldAlert className="size-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-400/80 leading-relaxed">
          You can only manage accounts with a lower role than yours.
          Protected accounts (Root/Founder) cannot be modified from this UI.
          All actions here require step-up authentication and are logged.
        </p>
      </div>

      {isError && !rawData && <AdminErrorState onRetry={() => void refetch()} />}

      {isLoading && !rawData ? (
        <AdminTableSkeleton rows={4} cols={5} />
      ) : (
        <>
          {/* Active admins table */}
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Admin</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">2FA</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Last action</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 w-28">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {activeAdmins.map((account) => (
                  <AdminRow
                    key={account.id}
                    account={account}
                    selfId={admin!.id}
                    selfRole={admin!.role}
                    onAction={(target, action) => setPendingAction({ target, action })}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Deactivated section */}
          {deactivatedAdmins.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2 px-1">
                Deactivated ({deactivatedAdmins.length})
              </p>
              <div className="rounded-xl border border-white/5 overflow-hidden opacity-50">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-white/[0.04]">
                    {deactivatedAdmins.map((account) => (
                      <AdminRow
                        key={account.id}
                        account={account}
                        selfId={admin!.id}
                        selfRole={admin!.role}
                        onAction={() => {}}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm dialog */}
      {pendingAction && (
        <ConfirmWithReasonDialog
          open
          title={ACTION_CONFIG[pendingAction.action].title}
          description={ACTION_CONFIG[pendingAction.action].description}
          confirmLabel={ACTION_CONFIG[pendingAction.action].label}
          destructive={ACTION_CONFIG[pendingAction.action].destructive}
          requireReason
          onConfirm={async (reason) => {
            await mutateAction.mutateAsync({ ...pendingAction, reason });
          }}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
