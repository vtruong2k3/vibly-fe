"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag, Clock, CheckCircle, XCircle, ChevronUp } from "lucide-react";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminReportsService from "@/lib/services/admin-reports.service";
import type {
  AdminReportListItem,
  ReportStatus,
  ReportSeverity,
} from "@/types/admin.types";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { cn } from "@/lib/utils";
import AdminTableSkeleton from "./admin-table-skeleton";
import AdminErrorState from "./admin-error-state";
import AdminEmptyState from "./admin-empty-state";
import ConfirmWithReasonDialog from "./confirm-with-reason-dialog";

// ─── Config maps ─────────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<ReportSeverity, { label: string; classes: string; pulse?: boolean }> = {
  CRITICAL: { label: "Critical", classes: "bg-red-500/10 text-red-400 border-red-500/30", pulse: true },
  HIGH:     { label: "High",     classes: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  MEDIUM:   { label: "Medium",   classes: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  LOW:      { label: "Low",      classes: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

const STATUS_TABS: { label: string; value: ReportStatus | "ALL" }[] = [
  { label: "All",       value: "ALL" },
  { label: "Open",      value: "OPEN" },
  { label: "Reviewing", value: "REVIEWING" },
  { label: "Resolved",  value: "RESOLVED" },
  { label: "Dismissed", value: "DISMISSED" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: ReportSeverity }) {
  const { label, classes, pulse } = SEVERITY_CONFIG[severity];
  return (
    <span className={cn("relative inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", classes)}>
      {pulse && (
        <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-red-400 animate-ping" />
      )}
      {label}
    </span>
  );
}

function TargetTypeBadge({ type }: { type: AdminReportListItem["targetType"] }) {
  const colors = {
    POST:    "text-blue-400 bg-blue-500/10",
    COMMENT: "text-teal-400 bg-teal-500/10",
    USER:    "text-amber-400 bg-amber-500/10",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium", colors[type])}>
      {type}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminReportsContent() {
  const qc = useQueryClient();
  const { hasPermission } = useAdminAuthStore();
  const isAdmin = hasPermission("ADMIN");

  const [statusFilter, setStatusFilter]   = useState<ReportStatus | "ALL">("OPEN");
  const [selectedReport, setSelectedReport] = useState<AdminReportListItem | null>(null);
  const [confirming, setConfirming]        = useState<"RESOLVE" | "DISMISS" | null>(null);
  const [cursor, setCursor]               = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack]     = useState<string[]>([]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.reports, statusFilter, cursor],
    queryFn: () =>
      adminReportsService.list({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        cursor,
        limit: 25,
      }),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.reports });

  const mutateReviewing = useMutation({
    mutationFn: (id: string) => adminReportsService.markReviewing(id),
    onSuccess: invalidate,
  });

  const mutateResolve = useMutation({
    mutationFn: ({ id, resolveNote }: { id: string; resolveNote: string }) =>
      adminReportsService.resolve(id, resolveNote),
    onSuccess: () => { invalidate(); setSelectedReport(null); setConfirming(null); },
  });

  const mutateDismiss = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminReportsService.dismiss(id, reason),
    onSuccess: () => { invalidate(); setSelectedReport(null); setConfirming(null); },
  });

  const reports = data?.data ?? [];

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-white">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage and review platform reports</p>
      </div>

      {/* Stale banner */}
      {isError && data && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-2.5 text-xs text-orange-400">
          <span>⚠ Cannot refresh — showing last known reports.</span>
          <button onClick={() => void refetch()} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* Error state */}
      {isError && !data && <AdminErrorState onRetry={() => void refetch()} />}

      {/* Status tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-0.5 self-start overflow-x-auto">
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              "px-3 h-7 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
              statusFilter === value
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && !data ? (
        <AdminTableSkeleton rows={8} cols={5} />
      ) : reports.length === 0 ? (
        <AdminEmptyState message="No reports in this category." />
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="w-full text-left rounded-xl bg-[#0D1526] border border-white/5 hover:border-white/10 p-4 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <TargetTypeBadge type={report.targetType} />
                </div>
                <span className="text-xs text-slate-600 shrink-0">
                  {new Date(report.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short",
                  })}
                </span>
              </div>

              <p className="text-sm text-slate-300 mt-2 font-medium">{report.reasonCode}</p>
              <p className="text-xs text-slate-500 mt-1">
                Reported by @{report.reporter?.username ?? "unknown"}
                {report.assignedTo && ` · Assigned to @${report.assignedTo.username}`}
              </p>

              {/* Quick actions on hover */}
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                {report.status === "OPEN" && (
                  <button
                    onClick={() => void mutateReviewing.mutate(report.id)}
                    className="flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                  >
                    <Clock className="size-3" /> Review
                  </button>
                )}
                <button
                  onClick={() => { setSelectedReport(report); setConfirming("RESOLVE"); }}
                  className="flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  <CheckCircle className="size-3" /> Resolve
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { setSelectedReport(report); setConfirming("DISMISS"); }}
                    className="flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-slate-500/10 text-slate-400 text-xs font-medium hover:bg-slate-500/20 transition-colors"
                  >
                    <XCircle className="size-3" /> Dismiss
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Confirm dialogs */}
      {confirming === "RESOLVE" && selectedReport && (
        <ConfirmWithReasonDialog
          open
          title="Resolve this report?"
          description="Mark as resolved. Include the action taken."
          confirmLabel="Resolve"
          requireReason
          onConfirm={async (resolveNote) => {
            await mutateResolve.mutateAsync({ id: selectedReport.id, resolveNote });
          }}
          onClose={() => setConfirming(null)}
        />
      )}

      {confirming === "DISMISS" && selectedReport && (
        <ConfirmWithReasonDialog
          open
          title="Dismiss this report?"
          description="Mark this report as invalid or not actionable."
          confirmLabel="Dismiss"
          requireReason
          onConfirm={async (reason) => {
            await mutateDismiss.mutateAsync({ id: selectedReport.id, reason });
          }}
          onClose={() => setConfirming(null)}
        />
      )}
    </div>
  );
}
