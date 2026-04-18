"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminAnalyticsService from "@/lib/services/admin-analytics.service";

interface Props {
  days: number;
}

// Custom dark-mode tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0D1526]/95 backdrop-blur px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300 capitalize">{p.name}</span>
          <span className="ml-auto pl-4 font-semibold tabular-nums text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ContentTrendChart({ days }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.analyticsContent, days],
    queryFn: () => adminAnalyticsService.getContentTrend(days),
    staleTime: 60_000,
  });

  const chartData = useMemo(() => {
    if (!data?.posts?.length) return [];
    return data.posts.map((p, i) => ({
      date: new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      posts: p.count,
      comments: data.comments?.[i]?.count ?? 0,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-56 rounded-xl bg-white/[0.02] animate-pulse" />
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-56 rounded-xl bg-white/[0.02] flex items-center justify-center">
        <p className="text-slate-600 text-sm">No content activity in this period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="gPosts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gComments" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={Math.ceil(chartData.length / 7) - 1}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={6}
          wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 8 }}
        />
        <Area
          type="monotone"
          dataKey="posts"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#gPosts)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="comments"
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#gComments)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
