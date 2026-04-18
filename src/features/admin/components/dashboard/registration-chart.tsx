"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminAnalyticsService from "@/lib/services/admin-analytics.service";

interface Props {
  from?: string;
  to?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0D1526]/95 backdrop-blur px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-semibold tabular-nums text-blue-400">
        {payload[0].value} new users
      </p>
    </div>
  );
}

export default function RegistrationChart({ from, to }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.analyticsRegistrations, from, to],
    queryFn: () => adminAnalyticsService.getRegistrationTrend(from, to),
    staleTime: 60_000,
  });

  const { chartData, avg } = useMemo(() => {
    if (!data?.length) return { chartData: [], avg: 0 };
    const avg = data.reduce((sum, d) => sum + d.count, 0) / data.length;
    return {
      chartData: data.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        count: d.count,
        isAboveAvg: d.count > avg,
      })),
      avg,
    };
  }, [data]);

  if (isLoading) {
    return <div className="h-56 rounded-xl bg-white/[0.02] animate-pulse" />;
  }

  if (!chartData.length) {
    return (
      <div className="h-56 rounded-xl bg-white/[0.02] flex items-center justify-center">
        <p className="text-slate-600 text-sm">No registrations in this period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={chartData.length <= 7 ? 20 : 10}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.isAboveAvg ? "#3B82F6" : "rgba(59,130,246,0.3)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
