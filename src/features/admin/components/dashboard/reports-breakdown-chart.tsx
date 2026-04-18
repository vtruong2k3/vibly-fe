"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminAnalyticsService from "@/lib/services/admin-analytics.service";

const PALETTE = [
  "#3B82F6", // blue
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { pct: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-[#0D1526]/95 backdrop-blur px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-medium">{item.name.replace(/_/g, " ")}</p>
      <p className="text-blue-400 tabular-nums mt-0.5">
        {item.value} reports ({item.payload.pct}%)
      </p>
    </div>
  );
}

interface Props {
  from?: string;
  to?: string;
}

export default function ReportsBreakdownChart({ from, to }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.analyticsReports, from, to],
    queryFn: () => adminAnalyticsService.getReportsBreakdown(from, to),
    staleTime: 60_000,
  });

  const chartData = useMemo(() => {
    if (!data?.length) return [];
    const total = data.reduce((sum, r) => sum + r.count, 0);
    return data
      .filter((r) => r.count > 0)
      .map((r) => ({
        name: r.reasonCode,
        value: r.count,
        pct: total ? Math.round((r.count / total) * 100) : 0,
      }));
  }, [data]);

  if (isLoading) {
    return <div className="h-56 rounded-xl bg-white/[0.02] animate-pulse" />;
  }

  if (!chartData.length) {
    return (
      <div className="h-56 rounded-xl bg-white/[0.02] flex items-center justify-center">
        <p className="text-slate-600 text-sm">No reports filed yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius="52%"
          outerRadius="72%"
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={6}
          wrapperStyle={{ fontSize: 10, color: "#94a3b8", paddingTop: 4 }}
          formatter={(v: string) => v.replace(/_/g, " ")}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
