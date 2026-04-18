"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users, UserPlus, Activity, FileText,
  MessageSquare, Flag, AlertTriangle, UserX,
  TrendingUp, TrendingDown, RefreshCw,
} from "lucide-react";
import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS, ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import type { AnalyticsOverview, BeAnalyticsOverview } from "@/types/admin.types";
import { mapAnalyticsOverview } from "@/types/admin.types";
import { cn } from "@/lib/utils";
import ContentTrendChart from "@/features/admin/components/dashboard/content-trend-chart";
import RegistrationChart from "@/features/admin/components/dashboard/registration-chart";
import ReportsBreakdownChart from "@/features/admin/components/dashboard/reports-breakdown-chart";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 7 | 30 | 90;

// ─── Placeholder ──────────────────────────────────────────────────────────────
const EMPTY: AnalyticsOverview = {
  totalUsers: 0, activeUsers: 0, suspendedUsers: 0, bannedUsers: 0,
  newUsersToday: 0, deltaNewUsers: 0, totalPostsToday: 0, commentsToday: 0,
  deltaPosts: 0, deltaComments: 0, reportsPending: 0, reportsCritical: 0,
};

// ─── KPI definitions ──────────────────────────────────────────────────────────
type Color = "blue" | "green" | "red" | "orange" | "slate";

const KPI_CARDS = (d: AnalyticsOverview) => [
  { label: "Total Users",       value: d.totalUsers.toLocaleString(),   icon: Users,         href: "/admin/users",                    color: "blue"  as Color, delta: null },
  { label: "New Today",         value: `+${d.newUsersToday}`,           icon: UserPlus,      href: "/admin/users?filter=new",          color: "green" as Color, delta: d.deltaNewUsers },
  { label: "Posts Today",       value: d.totalPostsToday.toLocaleString(), icon: FileText,   href: "/admin/content/posts",            color: "slate" as Color, delta: d.deltaPosts },
  { label: "Action Required",   value: (d.reportsPending + d.reportsCritical).toString(),     icon: AlertTriangle, href: "/admin/reports?status=OPEN",       color: d.reportsPending > 0 ? "red" as Color : "green" as Color,  delta: null, pulse: d.reportsCritical > 0 },
];

const COLOR_MAP: Record<Color, string> = {
  blue:   "text-blue-400 bg-blue-500/10 ring-blue-500/20",
  green:  "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
  red:    "text-red-400 bg-red-500/10 ring-red-500/20",
  orange: "text-orange-400 bg-orange-500/10 ring-orange-500/20",
  slate:  "text-slate-400 bg-slate-500/10 ring-slate-500/20",
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon: Icon, href, color, delta, pulse = false, skeleton = false,
}: {
  label: string; value: string; icon: React.ComponentType<{ className?: string }>;
  href: string; color: Color; delta: number | null; pulse?: boolean; skeleton?: boolean;
}) {
  if (skeleton) {
    return (
      <div className="rounded-2xl bg-[#0D1526] border border-white/5 p-5 animate-pulse">
        <div className="h-3.5 w-20 bg-white/5 rounded-full mb-4" />
        <div className="h-7 w-14 bg-white/5 rounded-full" />
      </div>
    );
  }

  const isUp = (delta ?? 0) >= 0;

  return (
    <a
      href={href}
      className="group relative rounded-2xl bg-[#0D1526] border border-white/5 p-5
                 hover:border-white/10 hover:bg-[#0F1A2E] hover:-translate-y-0.5
                 transition-all duration-150 cursor-pointer overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        <span className={cn("relative p-1.5 rounded-lg ring-1", COLOR_MAP[color])}>
          <Icon className="size-3.5" />
          {pulse && (
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-400 animate-ping" />
          )}
        </span>
      </div>

      <p className="text-2xl font-bold text-white tabular-nums tracking-tight">{value}</p>

      {delta !== null && (
        <div className={cn(
          "flex items-center gap-1 mt-2 text-xs font-medium",
          isUp ? "text-emerald-400" : "text-red-400",
        )}>
          {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          <span>{isUp ? "+" : ""}{delta?.toFixed(1)}% vs yesterday</span>
        </div>
      )}
    </a>
  );
}

// ─── Chart Section Card ───────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#0D1526] border border-white/5 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Period Selector ──────────────────────────────────────────────────────────
function PeriodSelector({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/[0.03] border border-white/5 p-0.5">
      {([7, 30, 90] as Period[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-all duration-150",
            value === p
              ? "bg-blue-500/20 text-blue-300 shadow-sm"
              : "text-slate-500 hover:text-slate-300",
          )}
        >
          {p}d
        </button>
      ))}
    </div>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────
export default function AdminDashboardContent() {
  const [period, setPeriod] = useState<Period>(30);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ADMIN_QUERY_KEYS.analyticsOverview,
    queryFn: async () => {
      const res = await adminApiClient.get<{ success: boolean; data: BeAnalyticsOverview }>(
        ADMIN_ENDPOINTS.analytics.overview,
      );
      return mapAnalyticsOverview(res.data.data);
    },
    placeholderData: EMPTY,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const overview = data ?? EMPTY;
  const cards = KPI_CARDS(overview);
  const showSkeleton = isLoading && !data;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">System health at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300
                       transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {isError && data && (
        <div role="alert" className="flex items-center gap-2 rounded-xl bg-orange-500/10
             border border-orange-500/20 px-4 py-2.5 text-xs text-orange-400">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>Unable to refresh — showing last known data.</span>
          <button onClick={() => void refetch()} className="ml-auto underline hover:text-orange-300">
            Retry
          </button>
        </div>
      )}

      {/* ── Full error (no data) ── */}
      {isError && !data && (
        <div role="alert" className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-10 text-center">
          <p className="text-sm text-red-400 font-medium">Failed to load dashboard data</p>
          <button onClick={() => void refetch()} className="mt-3 text-xs text-red-400/70 underline hover:text-red-400">
            Retry
          </button>
        </div>
      )}

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} skeleton={showSkeleton} />
        ))}
      </div>

      {/* ── Charts row 1: Area Chart (65%) + Bar Chart (35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ChartCard
            title="Content Activity"
            subtitle={`Posts & comments — last ${period} days`}
          >
            <ContentTrendChart days={period} />
          </ChartCard>
        </div>
        <div className="lg:col-span-2">
          <ChartCard
            title="New Registrations"
            subtitle={`Daily signups — last ${period} days`}
          >
            <RegistrationChart days={period} />
          </ChartCard>
        </div>
      </div>

      {/* ── Charts row 2: Donut (Reports) + User Status Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ChartCard title="Report Breakdown" subtitle="By violation type">
            <ReportsBreakdownChart />
          </ChartCard>
        </div>

        {/* User status mini-grid */}
        <div className="lg:col-span-2">
          <ChartCard title="User Status Overview" subtitle="Current account standing">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
              {[
                { label: "Active",    value: overview.activeUsers,    color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Suspended", value: overview.suspendedUsers, color: "text-orange-400",  bg: "bg-orange-500/10" },
                { label: "Banned",    value: overview.bannedUsers,    color: "text-red-400",     bg: "bg-red-500/10" },
                { label: "Total",     value: overview.totalUsers,     color: "text-blue-400",    bg: "bg-blue-500/10" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn("rounded-xl p-4 flex flex-col gap-1", item.bg)}
                >
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className={cn("text-2xl font-bold tabular-nums", item.color)}>
                    {item.value.toLocaleString()}
                  </span>
                  {overview.totalUsers > 0 && (
                    <span className="text-xs text-slate-600">
                      {Math.round((item.value / overview.totalUsers) * 100)}%
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Progress bar visual */}
            {overview.totalUsers > 0 && (
              <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden flex">
                <div
                  style={{ width: `${(overview.activeUsers / overview.totalUsers) * 100}%` }}
                  className="bg-emerald-500/60 transition-all duration-700"
                />
                <div
                  style={{ width: `${(overview.suspendedUsers / overview.totalUsers) * 100}%` }}
                  className="bg-orange-500/60 transition-all duration-700"
                />
                <div
                  style={{ width: `${(overview.bannedUsers / overview.totalUsers) * 100}%` }}
                  className="bg-red-500/60 transition-all duration-700"
                />
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
