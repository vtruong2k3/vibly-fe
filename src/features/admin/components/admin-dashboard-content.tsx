"use client";

import React from "react";
import { TrendingUp, TrendingDown, MoreHorizontal, AlertCircle } from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminAnalyticsService from "@/lib/services/admin-analytics.service";
import type { AnalyticsOverview, AnalyticsTrend, AnalyticsContentTrend } from "@/types/admin.types";
import { fmtNum } from "@/lib/Helpers";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// --- Helpers ---


const TOOLTIP_STYLE = {
  borderRadius: "14px",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 8px 24px -4px rgba(0,0,0,0.12)",
  backgroundColor: "rgba(255,255,255,0.97)",
  backdropFilter: "blur(10px)",
  color: "#0f172a",
  fontSize: 12,
  fontWeight: 600,
};

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{title}</h3>
);

// --- KPI Card using real data ---

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: number;
  isProgress?: boolean;
  progressValue?: number;
  idx: number;
}

interface PlatformData {
  name: string;
  value: number;
  fill: string;
}

interface PostCategory {
  name: string;
  percentage: number;
  color: string;
}

interface ModerationQueueItem {
  id: string;
  user: string;
  reason: string;
  time: string;
  status: string;
}

interface SystemStatusItem {
  name: string;
  status: string;
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, trend, isProgress, progressValue, idx }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.06 }}
    className="bg-white border border-slate-100 p-5 rounded-3xl flex flex-col justify-between h-36 shadow-sm hover:shadow-md transition-shadow"
  >
    <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{label}</h3>
    <div className="flex flex-col gap-1">
      <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
      {isProgress ? (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="bg-indigo-500 h-full rounded-full"
          />
        </div>
      ) : trend !== undefined ? (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{trend >= 0 ? `+${trend}` : trend}%</span>
        </div>
      ) : null}
    </div>
  </motion.div>
);

const KpiSkeleton = () => (
  <div className="bg-white border border-slate-100 p-5 rounded-3xl h-36 shadow-sm animate-pulse">
    <div className="h-3 w-20 bg-slate-100 rounded mb-4" />
    <div className="h-8 w-28 bg-slate-100 rounded" />
  </div>
);



export default function AdminDashboardContent() {
  // --- Real API calls via React Query ---

  const to = new Date().toISOString();
  const from = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: overview, isLoading: overviewLoading, isError: overviewError } = useQuery({
    queryKey: ADMIN_QUERY_KEYS.analyticsOverview,
    queryFn: () => adminAnalyticsService.getOverview(from, to),
    staleTime: 60_000,
  });

  const { data: registrations } = useQuery({
    queryKey: ADMIN_QUERY_KEYS.analyticsRegistrations,
    queryFn: () => adminAnalyticsService.getRegistrationTrend(from, to),
    staleTime: 60_000,
  });

  const { data: contentTrend } = useQuery({
    queryKey: ADMIN_QUERY_KEYS.analyticsContent,
    queryFn: () => adminAnalyticsService.getContentTrend(from, to),
    staleTime: 60_000,
  });

  const { data: platformData = [] } = useQuery({
    queryKey: ["admin-platforms"],
    queryFn: adminAnalyticsService.getPlatformDistribution,
    staleTime: 60_000,
  });

  const { data: moderationResolution = [] } = useQuery({
    queryKey: ["admin-mod-resolution", from, to],
    queryFn: () => adminAnalyticsService.getModerationResolution(from, to),
    staleTime: 60_000,
  });

  const { data: rawHeatmapData = [] } = useQuery({
    queryKey: ["admin-heatmap", from, to],
    queryFn: () => adminAnalyticsService.getActivityHeatmap(from, to),
    staleTime: 60_000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories", from, to],
    queryFn: () => adminAnalyticsService.getPostCategories(from, to),
    staleTime: 60_000,
  });

  const { data: moderationQueue = [] } = useQuery({
    queryKey: ["admin-queue"],
    queryFn: adminAnalyticsService.getModerationQueue,
    staleTime: 60_000,
  });

  const { data: systemStatusDb = [] } = useQuery({
    queryKey: ["admin-system-status"],
    queryFn: adminAnalyticsService.getSystemStatus,
    staleTime: 60_000,
  });

  // Build KPI items from real data
  const kpiItems: KpiCardProps[] = overview
    ? [
      { label: "Total Users", value: fmtNum(overview.totalUsers), trend: overview.deltaNewUsers, idx: 0 },
      { label: "Active Users", value: fmtNum(overview.activeUsers), idx: 1 },
      { label: "Posts (Period)", value: fmtNum(overview.totalPostsToday), trend: overview.deltaPosts, idx: 2 },
      { label: "Open Reports", value: `${overview.reportsPending}`, trend: undefined, idx: 3 },
      { label: "Suspended", value: `${overview.suspendedUsers}`, idx: 4 },
      { label: "Critical Reports", value: `${overview.reportsCritical}`, idx: 5 },
    ]
    : [];

  // Combine registration + content trend for area chart
  const buildVolumeChart = () => {
    if (!registrations && !contentTrend) return [];
    const dateMap = new Map<string, { day: string; users: number; posts: number; comments: number }>();

    (registrations ?? []).forEach((r: AnalyticsTrend) => {
      const label = r.date.slice(5); // MM-DD
      dateMap.set(r.date, { day: label, users: r.count, posts: 0, comments: 0 });
    });

    (contentTrend?.posts ?? []).forEach((r: AnalyticsTrend) => {
      const existing = dateMap.get(r.date);
      if (existing) existing.posts = r.count;
      else dateMap.set(r.date, { day: r.date.slice(5), users: 0, posts: r.count, comments: 0 });
    });

    (contentTrend?.comments ?? []).forEach((r: AnalyticsTrend) => {
      const existing = dateMap.get(r.date);
      if (existing) existing.comments = r.count;
    });

    return Array.from(dateMap.values()).sort((a, b) => a.day.localeCompare(b.day));
  };

  const volumeChartData = buildVolumeChart();

  const systemStatus = systemStatusDb.length > 0 ? systemStatusDb : [
    { name: "API Gateway", status: overviewError ? "Degraded" : "Loading...", color: overviewError ? "bg-amber-400" : "bg-slate-300" },
    { name: "Database Main", status: "Loading...", color: "bg-slate-300" },
    { name: "Background Jobs", status: "Loading...", color: "bg-slate-300" },
  ];

  // Prepare ApexCharts Heatmap
  const heatmapSeries = React.useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(d => {
      const dataForDay = rawHeatmapData.filter((r: any) => r.day === d);
      return {
        name: d,
        data: dataForDay.map((r: any) => ({ x: r.hour, y: r.value }))
      };
    });
  }, [rawHeatmapData]);

  const heatmapOptions: any = {
    chart: { type: 'heatmap', toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 8,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            { from: 0, to: 10, color: '#F1F5F9', name: 'Low' },
            { from: 11, to: 40, color: '#E0E7FF', name: 'Medium' },
            { from: 41, to: 75, color: '#818CF8', name: 'High' },
            { from: 76, to: 100, color: '#4338CA', name: 'Peak' }
          ]
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 3, colors: ['#ffffff'] },
    xaxis: { labels: { style: { colors: '#94A3B8', fontWeight: 600 } }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: '#94A3B8', fontWeight: 600 } } },
    grid: { show: false },
    tooltip: { theme: 'light' },
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
        <p className="text-sm text-slate-500">Platform performance and activity summary.</p>
      </div>

      {/* Error banner */}
      {overviewError && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          Unable to load analytics data. Showing cached / fallback information.
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {overviewLoading
          ? Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpiItems.map((item) => <KpiCard key={item.label} {...item} />)
        }
      </div>

      {/* Row 1: Volume Activity + Post Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Activity Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="flex items-center justify-between relative z-10 mb-4">
            <SectionTitle title="Volume Activity (last 30 days)" />
            <button className="text-slate-400 hover:text-slate-600 transition-colors"><MoreHorizontal size={18} /></button>
          </div>
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E396" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#00E396" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4560" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#FF4560" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gComments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008FFB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#008FFB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F7" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="users" stroke="#00E396" strokeWidth={2} fill="url(#gUsers)" name="New Users" />
                <Area type="monotone" dataKey="posts" stroke="#FF4560" strokeWidth={2} fill="url(#gPosts)" name="Posts" />
                <Area type="monotone" dataKey="comments" stroke="#008FFB" strokeWidth={2} fill="url(#gComments)" name="Comments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-4 relative z-10">
            {[["#00E396", "New Users"], ["#FF4560", "Posts"], ["#008FFB", "Comments"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Post Categories */}
        <div className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle title="Post Categories" />
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
          </div>
          <div className="space-y-5 pt-2">
            {categories.map((cat: PostCategory, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-semibold">{cat.name}</span>
                  <span className="text-slate-900 font-bold">{cat.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.12 }}
                    className={`${cat.color} h-full rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Moderation Resolution + Platform Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moderation Resolution */}
        <div className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle title="Moderation Resolution (This Week)" />
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moderationResolution} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F7" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(16,185,129,0.04)", radius: 8 }} />
                <Bar dataKey="approved" stackId="a" fill="#10B981" />
                <Bar dataKey="rejected" stackId="a" fill="#F43F5E" />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-3">
            {[["#10B981", "Approved"], ["#F43F5E", "Rejected"], ["#F59E0B", "Pending"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-xs font-semibold text-slate-500">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Split - Donut Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <SectionTitle title="Platform Distribution" />
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={3} dataKey="value" stroke="none">
                    {platformData.map((entry: PlatformData, i: number) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-1">
              {platformData.map((p: PlatformData) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
                  <span className="text-xs font-semibold text-slate-500 truncate">{p.name}</span>
                  <span className="text-xs font-bold text-slate-800 ml-auto">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Activity Heatmap */}
      <div className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <SectionTitle title="User Activity Heatmap (By Day & Hour)" />
          <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
        </div>
        <div className="w-full">
          {rawHeatmapData.length > 0 ? (
            <ReactApexChart options={heatmapOptions} series={heatmapSeries} type="heatmap" height={320} />
          ) : (
            <div className="h-[320px] bg-slate-50 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm font-semibold">
              Loading map...
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Moderation Queue + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Moderation Queue Preview */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Moderation Queue Preview</h3>
            <a href="/admin/reports" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All →</a>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-50">
                <th className="pb-3">USER</th>
                <th className="pb-3">REASON</th>
                <th className="pb-3">TIMESTAMP</th>
                <th className="pb-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {moderationQueue.map((item: ModerationQueueItem, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-sm font-bold text-slate-900">{item.user}</td>
                  <td className="py-3 text-sm text-slate-500">{item.reason}</td>
                  <td className="py-3 text-sm text-slate-500">{item.time}</td>
                  <td className="py-3">
                    <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-3 py-1 rounded-full border border-rose-100">{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Status */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm space-y-4">
            <SectionTitle title="System Status" />
            <div className="space-y-3">
              {systemStatus.map((s: SystemStatusItem, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-sm text-slate-900 font-semibold">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats from real overview data */}
          {overview && (
            <div className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm space-y-3">
              <SectionTitle title="Health Indicators" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Banned users</span>
                  <span className="font-bold text-rose-600">{overview.bannedUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Suspended users</span>
                  <span className="font-bold text-amber-600">{overview.suspendedUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Critical reports</span>
                  <span className="font-bold text-indigo-600">{overview.reportsCritical.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
