"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Lock, RefreshCw } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminAuditLogsService from "@/lib/services/admin-audit-logs.service";
import type { AuditLogEntry } from "@/types/admin.types";
import { cn } from "@/lib/utils";
import AdminTableSkeleton from "./admin-table-skeleton";
import AdminErrorState from "./admin-error-state";
import AdminEmptyState from "./admin-empty-state";

// ─── Action color map (BE sends raw action strings, no fixed enum) ────────────
const ACTION_GROUPS: Record<string, string> = {
  // User actions
  USER_SUSPENDED:  "bg-orange-500/10 text-orange-400",
  USER_BANNED:     "bg-red-500/10 text-red-400",
  USER_ACTIVATED:  "bg-emerald-500/10 text-emerald-400",
  USER_ROLE_CHANGED: "bg-amber-500/10 text-amber-400",
  // Content
  CONTENT_REMOVED:  "bg-red-500/10 text-red-400",
  CONTENT_RESTORED: "bg-emerald-500/10 text-emerald-400",
  // Reports
  REPORT_RESOLVED:  "bg-emerald-500/10 text-emerald-400",
  REPORT_DISMISSED: "bg-slate-500/10 text-slate-400",
  REPORT_ESCALATED: "bg-orange-500/10 text-orange-400",
  REPORT_REVIEWING: "bg-blue-500/10 text-blue-400",
  // Auth
  ADMIN_LOGIN:      "bg-blue-500/10 text-blue-400",
  ADMIN_LOGOUT:     "bg-slate-500/10 text-slate-400",
  TOTP_VERIFIED:    "bg-blue-500/10 text-blue-400",
  TOTP_SETUP:       "bg-teal-500/10 text-teal-400",
  // Accounts
  ACCOUNT_CREATED:    "bg-teal-500/10 text-teal-400",
  ACCOUNT_DEACTIVATED:"bg-red-500/10 text-red-400",
};

function actionColor(action: string): string {
  return ACTION_GROUPS[action] ?? "bg-slate-500/10 text-slate-400";
}

// ─── Entity deep-link ─────────────────────────────────────────────────────────
const ENTITY_LINK: Record<string, (id: string | null) => string | null> = {
  USER:    (id) => id ? `/admin/users?id=${id}` : null,
  POST:    (id) => id ? `/admin/content/posts?id=${id}` : null,
  COMMENT: (id) => id ? `/admin/content/comments?id=${id}` : null,
  REPORT:  (id) => id ? `/admin/reports?id=${id}` : null,
  ACCOUNT: (id) => id ? `/admin/admins?id=${id}` : null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminAuditLogContent() {
  const [search, setSearch]           = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [cursor, setCursor]           = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.auditLogs, { search: debouncedSearch, actionFilter, cursor }],
    queryFn: () =>
      adminAuditLogsService.list({
        action:    actionFilter !== "ALL" ? actionFilter : undefined,
        cursor,
        limit:     50,
      }),
    staleTime: 60_000,
  });

  const logs = data?.data ?? [];

  const handleNext = () => {
    if (!data?.meta.nextCursor) return;
    setCursorStack((s) => [...s, cursor ?? ""]);
    setCursor(data.meta.nextCursor);
  };

  const handlePrev = () => {
    const stack = [...cursorStack];
    const prev = stack.pop();
    setCursorStack(stack);
    setCursor(prev || undefined);
  };

  const ACTION_FILTER_OPTIONS = [
    { label: "All actions",          value: "ALL" },
    { label: "User moderation",      value: "USER_SUSPENDED" },
    { label: "User bans",            value: "USER_BANNED" },
    { label: "Content actions",      value: "CONTENT_REMOVED" },
    { label: "Report actions",       value: "REPORT_RESOLVED" },
    { label: "Admin auth",           value: "ADMIN_LOGIN" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Lock className="size-3" />
            Immutable — entries cannot be deleted or modified
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-600" />
          <input
            id="audit-search"
            type="search"
            placeholder="Search actor, entity ID…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCursor(undefined);
              setCursorStack([]);
            }}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setCursor(undefined);
            setCursorStack([]);
          }}
          className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {ACTION_FILTER_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value} className="bg-[#0D1526]">
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Stale / Error banners */}
      {isError && data && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-2.5 text-xs text-orange-400">
          ⚠ Showing cached log.
          <button onClick={() => void refetch()} className="ml-auto underline">Retry</button>
        </div>
      )}
      {isError && !data && <AdminErrorState onRetry={() => void refetch()} />}

      {/* Timeline */}
      {isLoading && !data ? (
        <AdminTableSkeleton rows={8} cols={5} />
      ) : logs.length === 0 ? (
        <AdminEmptyState message="No log entries found." />
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/5" />

          <div className="space-y-1 pl-10">
            {logs.map((log: AuditLogEntry) => {
              const entityLink = log.entityId
                ? ENTITY_LINK[log.entityType]?.(log.entityId)
                : null;

              return (
                <div key={log.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-10 top-3.5 size-2 rounded-full ring-2 ring-[#0B1120] bg-blue-400" />

                  <div className="rounded-xl bg-[#0D1526] border border-white/5 hover:border-white/10 px-4 py-3 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      {/* Left */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Action badge */}
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-medium font-mono",
                          actionColor(log.action),
                        )}>
                          {log.action}
                        </span>

                        {/* Entity deeplink */}
                        {entityLink ? (
                          <a
                            href={entityLink}
                            className="text-xs text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {log.entityType.toLowerCase()}/{log.entityId}
                          </a>
                        ) : log.entityId ? (
                          <span className="text-xs text-slate-600">
                            {log.entityType.toLowerCase()}/{log.entityId}
                          </span>
                        ) : null}
                      </div>

                      {/* Right — time */}
                      <span className="text-xs text-slate-600 shrink-0">
                        {formatRelative(log.createdAt)}
                      </span>
                    </div>

                    {/* Actor + IP */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-500">
                        by{" "}
                        <span className="text-slate-300 font-medium">
                          {log.actor.username}
                        </span>{" "}
                        <span className="text-slate-700">({log.actor.role})</span>
                      </span>
                      {log.ip && (
                        <span className="text-xs text-slate-700">
                          from {log.ip}
                        </span>
                      )}
                    </div>

                    {/* Reason / payload */}
                    {log.reason && (
                      <p className="text-xs text-slate-600 mt-1.5 italic">
                        "{log.reason}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cursor pagination */}
      {(cursorStack.length > 0 || data?.meta.nextCursor) && (
        <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
          <button onClick={handlePrev} disabled={cursorStack.length === 0}
            className="px-3 h-7 rounded-md border border-white/10 hover:border-white/20 disabled:opacity-40 transition-colors">
            Prev
          </button>
          <button onClick={handleNext} disabled={!data?.meta.nextCursor}
            className="px-3 h-7 rounded-md border border-white/10 hover:border-white/20 disabled:opacity-40 transition-colors">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
