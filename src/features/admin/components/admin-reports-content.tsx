"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminReportsService from "@/lib/services/admin-reports.service";
import type { AdminReportListItem, ReportStatus } from "@/types/admin.types";

import { ReportList } from "./reports/report-list";
import { ReportDetail } from "./reports/report-detail";

export default function AdminReportsContent() {
    const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("OPEN");
    const [selectedReport, setSelectedReport] = useState<AdminReportListItem | null>(null);
    const [cursor, setCursor] = useState<string | undefined>(undefined);

    const { data, isLoading } = useQuery({
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

    const reports = data?.data ?? [];

    // Auto select first report if available and none selected
    useEffect(() => {
        if (reports.length > 0 && !selectedReport) {
            setSelectedReport(reports[0]);
        } else if (reports.length === 0) {
            setSelectedReport(null);
        }
    }, [reports, selectedReport]);

    return (
        <div className="flex h-full w-full overflow-hidden bg-slate-50 absolute inset-0 text-slate-900 border-l border-slate-200">
            {/* 
        The layout places ReportList entirely on the left with a flex-shrink layout.
        ReportDetail takes up the remaining flexible width. 
      */}
            <ReportList
                reports={reports}
                selectedReportId={selectedReport?.id}
                onSelectReport={setSelectedReport}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                isLoading={isLoading}
            />

            <ReportDetail
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
            />
        </div>
    );
}
