"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  FileText,
  Flag,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminAnalyticsService from "@/lib/services/admin-analytics.service";
import type { AnalyticsTrend, AnalyticsContentTrend } from "@/types/admin.types";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 7 | 30 | 90;

// ─── Mini Sparkline (CSS-only bar chart) ─────────────────────────────────────
function Sparkline({ data, color = "bg-blue-400" }: { data: AnalyticsTrend[]; color?: string }) {
  if (!data.length) return <div className="h-12 w-full rounded bg-white/[0.02]" />;
  const max = Math.max(...data.map((d) => d.count), 1);
  const slice = data.slice(-28);
  return (
    <div className="flex items-end gap-px h-12 w-full" aria-hidden="true">
      {slice.map((point) => (
        <div
          key={point.date}
          className={cn("flex-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity", color)}
          style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
          title={`${point.date}: ${point.count}`}
        />
      ))}
    </div>
  );
}

// ─── Stat row ────────────────────────────────────────────────────────────────
function StatRow({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
}) {
  const isUp = (trend ?? 0) >= 0;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm text-slate-300">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white tabular-nums">{value}</p>
        {trend !== undefined && (
          <p className={cn("text-xs flex items-center gap-1 mt-0.5 justify-end", isUp ? "text-emerald-400" : "text-red-400")}>
            {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {isUp ? "+" : ""}{trend.toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Section card ────────────────────────────────────────────────────────────
function AnalyticsCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#0D1526] border border-white/5 p-5 space-y-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="size-4" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return <div className="rounded-xl bg-[#0D1526] border border-white/5 p-5 h-56 animate-pulse" />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminAnalyticsContent() {
  const [days, setDays] = useState<Period>(30);
  const isAdmin = useAdminAuthStore((s) => s.hasPermission("ADMIN"));

  // Parallel queries
  const overview = useQuery({
    queryKey: ADMIN_QUERY_KEYS.analyticsOverview,
    queryFn:  () => adminAnalyticsService.getOverview(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const registrations = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.analyticsRegistrations, days],
    queryFn:  () => adminAnalyticsService.getRegistrationTrend(days),
    staleTime: 60_000,
  });

  const content = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.analyticsContent, days],
    queryFn:  () => adminAnalyticsService.getContentTrend(days),
    staleTime: 60_000,
  });

  const isLoading = overview.isLoading || registrations.isLoading || content.isLoading;
  const kpi       = overview.data;
  const regData   = registrations.data ?? [];
  const contData  = (content.data ?? { posts: [], comments: [] }) as AnalyticsContentTrend;

  const PERIODS: { label: string; value: Period }[] = [
    { label: "7 days",  value: 7 },
    { label: "30 days", value: 30 },
    { label: "90 days", value: 90 },
  ];

  const avg = (arr: AnalyticsTrend[]) =>
    arr.length ? Math.round(arr.reduce((s, d) => s + d.count, 0) / arr.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform growth and moderation insights</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period tabs */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
            {PERIODS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className={cn(
                  "px-3 h-7 rounded-md text-xs font-medium transition-colors",
                  days === value ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => { void overview.refetch(); void registrations.refetch(); void content.refetch(); }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-40"
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          </button>

          {/* CSV export — ADMIN only */}
          {isAdmin && (
            <button className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors">
              <Download className="size-3.5" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Users */}
          <AnalyticsCard title="User Growth" icon={Users}>
            <Sparkline data={regData} color="bg-blue-400" />
            {kpi && (
              <div>
                <StatRow label="Total users"   value={kpi.totalUsers.toLocaleString()} />
                <StatRow label="Active users"  value={kpi.activeUsers.toLocaleString()} />
                <StatRow label="New (today)"   value={`+${kpi.newUsersToday}`} trend={kpi.deltaNewUsers} />
                <StatRow label="Suspended"     value={kpi.suspendedUsers} />
              </div>
            )}
          </AnalyticsCard>

          {/* Content */}
          <AnalyticsCard title="Content" icon={FileText}>
            <Sparkline data={contData.posts} color="bg-teal-400" />
            <div>
              <StatRow label="Posts / day (avg)"    value={avg(contData.posts).toLocaleString()} trend={kpi?.deltaPosts} />
              <StatRow label="Comments / day (avg)" value={avg(contData.comments).toLocaleString()} trend={kpi?.deltaComments} />
            </div>
          </AnalyticsCard>

          {/* Moderation */}
          <AnalyticsCard title="Moderation" icon={Flag}>
            <div className="h-12 flex items-center">
              <p className="text-xs text-slate-600">Report trend chart coming soon</p>
            </div>
            {kpi && (
              <div>
                <StatRow label="Open reports"    value={kpi.reportsPending} />
                <StatRow label="Critical reports" value={kpi.reportsCritical} />
                <StatRow label="Banned users"    value={kpi.bannedUsers} />
              </div>
            )}
          </AnalyticsCard>
        </div>
      )}
    </div>
  );
}
