"use client";

import React from "react";
import { Flag, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { AdminReportListItem, ReportStatus } from "@/types/admin.types";
import { cn } from "@/lib/utils";

interface ReportListProps {
    reports: AdminReportListItem[];
    selectedReportId: string | undefined;
    onSelectReport: (report: AdminReportListItem) => void;
    statusFilter: ReportStatus | "ALL";
    onStatusChange: (status: ReportStatus | "ALL") => void;
    isLoading: boolean;
}

const CATEGORIES = [
    { id: "ALL", label: "All Types" },
    { id: "HARASSMENT", label: "Harassment" },
    { id: "SPAM", label: "Spam" },
    { id: "HATE_SPEECH", label: "Hate Speech" },
];

export const ReportList: React.FC<ReportListProps> = ({
    reports,
    selectedReportId,
    onSelectReport,
    statusFilter,
    onStatusChange,
    isLoading,
}) => {
    return (
        <div
            className={cn(
                "flex flex-col border-r border-slate-200 bg-white shrink-0 w-full lg:w-[400px] xl:w-[450px] transition-all",
                selectedReportId ? "hidden lg:flex" : "flex"
            )}
        >
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-5">Moderation Queue</h2>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100 mb-6 font-body-base">
                    {(["OPEN", "REVIEWING", "RESOLVED"] as ReportStatus[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => onStatusChange(s)}
                            className={cn(
                                "flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all",
                                statusFilter === s
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            {s.toLowerCase()}
                            {s === "OPEN" && (
                                <span className="ml-2 px-1.5 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-black">
                                    !
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Category Filters (Visual only for now) */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            className={cn(
                                "px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all",
                                cat.id === "ALL"
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 relative min-h-0 font-body-base">
                {isLoading && reports.length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-medium">Loading reports...</div>
                )}

                {!isLoading && reports.length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-medium">No reports in this queue.</div>
                )}

                {reports.map((report) => {
                    const isSelected = selectedReportId === report.id;
                    const targetUser =
                        report.targetUser ??
                        report.targetPost?.author ??
                        report.targetComment?.author;

                    let categoryBadge = "bg-slate-100 text-slate-600";
                    if (report.severity === "CRITICAL") categoryBadge = "bg-red-50 text-red-600";
                    if (report.severity === "HIGH") categoryBadge = "bg-orange-50 text-orange-600";
                    if (report.severity === "MEDIUM") categoryBadge = "bg-purple-50 text-purple-600";

                    return (
                        <motion.div
                            key={report.id}
                            initial={false}
                            animate={{ backgroundColor: isSelected ? "#F8FAFC" : "#FFFFFF" }}
                            onClick={() => onSelectReport(report)}
                            className={cn(
                                "p-5 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50/50 group relative",
                                isSelected &&
                                "after:content-[''] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-indigo-600"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                            categoryBadge
                                        )}
                                    >
                                        {report.reasonCode}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-400 capitalize">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="text-[11px] font-black text-slate-300 leading-none">
                                    #{report.id.substring(0, 8).toUpperCase()}
                                </span>
                            </div>

                            {report.targetType === "POST" && (
                                <div className="flex gap-3 mb-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform border border-slate-200">
                                        <ImageIcon size={18} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 line-clamp-2 italic">
                                        {report.targetPost?.content || "No text content"}
                                    </p>
                                </div>
                            )}

                            {report.targetType !== "POST" && (
                                <p
                                    className={cn(
                                        "text-sm font-medium mb-4 line-clamp-2",
                                        isSelected ? "text-slate-900" : "text-slate-600"
                                    )}
                                >
                                    "{report.reasonNote || report.targetComment?.content || "User report"}"
                                </p>
                            )}

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {targetUser?.avatar ? (
                                        <img
                                            alt={targetUser.username}
                                            className="w-6 h-6 rounded-full ring-1 ring-slate-100"
                                            src={targetUser.avatar}
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full ring-1 ring-slate-100 bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-500">
                                            {targetUser?.username?.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-slate-700">
                                        {targetUser?.username || "Unknown"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-indigo-400 transition-colors">
                                    <Flag size={14} />
                                    <span className="text-[11px] font-bold">1 report</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
