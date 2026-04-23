"use client";

import React from "react";
import {
    Gavel,
    Trash2,
    ExternalLink,
    User as UserIcon,
    AlertTriangle,
    MoreVertical,
    ShieldOff,
    AlertCircle,
    ChevronRight,
    ShieldCheck,
    Flag,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import adminReportsService from "@/lib/services/admin-reports.service";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import type { AdminReportListItem } from "@/types/admin.types";

import { cn } from "@/lib/utils";

interface ReportDetailProps {
    report: AdminReportListItem | null;
    onClose: () => void;
}

export const ReportDetail: React.FC<ReportDetailProps> = ({ report, onClose }) => {
    const qc = useQueryClient();

    const mutateResolve = useMutation({
        mutationFn: ({ id, resolveNote }: { id: string; resolveNote: string }) =>
            adminReportsService.resolve(id, resolveNote),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.reports });
            onClose();
        },
    });

    const mutateDismiss = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            adminReportsService.dismiss(id, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.reports });
            onClose();
        },
    });

    if (!report) {
        return (
            <div className="flex-1 items-center justify-center bg-slate-50/30 hidden lg:flex">
                <div className="text-center font-body-base">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flag size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400">Select a report to view details</h3>
                </div>
            </div>
        );
    }

    const targetUser =
        report.targetUser ?? report.targetPost?.author ?? report.targetComment?.author;

    const contentText =
        report.targetPost?.content ?? report.targetComment?.content ?? report.reasonNote ?? "No additional text content";

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden font-body-base">
            {/* Header */}
            <div className="px-6 lg:px-10 py-6 lg:py-8 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start bg-white/50 backdrop-blur-sm z-10 gap-4">
                <div>
                    <button
                        onClick={onClose}
                        className="lg:hidden mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        &larr; Back to Queue
                    </button>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Report Details</h3>
                        {report.status === "OPEN" && (
                            <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 ring-1 ring-red-100">
                                <Gavel size={14} />
                                Action Required
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Report ID: <span className="text-slate-600">#{report.id.substring(0, 8)}</span> • Created{" "}
                        {new Date(report.createdAt).toLocaleString()}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    <button
                        onClick={() => mutateDismiss.mutate({ id: report.id, reason: "No violation found" })}
                        className="flex-1 xl:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all shadow-sm"
                    >
                        Ignore Report
                    </button>
                    <button
                        onClick={() => mutateResolve.mutate({ id: report.id, resolveNote: "Removed offensive content" })}
                        className="flex-1 xl:flex-none px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-sm transition-all shadow-lg shadow-red-100 flex items-center justify-center xl:justify-start gap-2"
                    >
                        <Trash2 size={18} />
                        Remove Content
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6 lg:py-10 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    {/* Left Column: Content & Reporters */}
                    <div className="col-span-1 lg:col-span-8 space-y-8">
                        {/* Reported Content Box */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                            <div className="px-5 lg:px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    REPORTED {report.targetType}
                                </h4>
                                <button className="text-indigo-600 hover:text-indigo-700 text-xs font-black flex items-center gap-1.5 transition-colors uppercase tracking-wider">
                                    View in Context <ExternalLink size={14} />
                                </button>
                            </div>
                            <div className="p-5 lg:p-8">
                                <div className="flex items-start gap-4 mb-6">
                                    {targetUser?.avatar ? (
                                        <img
                                            alt="User Avatar"
                                            className="w-10 h-10 lg:w-14 lg:h-14 rounded-2xl object-cover ring-4 ring-slate-50"
                                            src={targetUser?.avatar}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-slate-200 flex items-center justify-center font-bold text-lg text-slate-500 ring-4 ring-slate-50">
                                            {targetUser?.username?.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-900">
                                                {targetUser?.username || "Unknown User"}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-400 hidden sm:inline">
                                                @{targetUser?.username?.toLowerCase() || "unknown"}
                                            </span>
                                        </div>
                                        {report.targetType === "COMMENT" && (
                                            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                                Replying to{" "}
                                                <span className="text-indigo-500 hover:underline cursor-pointer">
                                                    Post
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="relative pl-4 lg:pl-14">
                                    <div className="p-4 lg:p-6 bg-red-50/30 border-l-4 border-red-500 rounded-r-2xl">
                                        <p className="text-base lg:text-lg font-medium text-slate-800 leading-relaxed italic whitespace-pre-wrap break-words">
                                            "{contentText}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reporters List */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                            <div className="px-5 lg:px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    REPORTING USERS (1)
                                </h4>
                            </div>
                            <div className="divide-y divide-slate-50">
                                <div className="p-5 lg:p-6 flex justify-between items-start hover:bg-slate-50/30 transition-colors">
                                    <div className="flex items-start gap-3 lg:gap-4">
                                        {report.reporter?.avatar ? (
                                            <img
                                                alt="Reporter Avatar"
                                                className="w-10 h-10 rounded-full ring-2 ring-white"
                                                src={report.reporter.avatar}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs ring-2 ring-white shrink-0">
                                                {report.reporter?.username?.substring(0, 2).toUpperCase() || "?"}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 mb-0.5">
                                                {report.reporter?.username || "Anonymous"}
                                            </p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                                {report.reasonCode}
                                            </p>
                                            <p className="text-sm font-medium text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 break-words">
                                                {report.reasonNote || "No additional note provided."}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] lg:text-[11px] font-black text-slate-300 uppercase shrink-0">
                                        {new Date(report.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: User Account Context */}
                    <div className="col-span-1 lg:col-span-4 space-y-8">
                        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-2xl shadow-slate-100/30 relative overflow-hidden group">
                            <div className="absolute top-4 right-4 group-hover:block hidden">
                                <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="relative mb-6">
                                    <div className="absolute -inset-2 bg-indigo-50 rounded-full blur-xl opacity-50"></div>
                                    {targetUser?.avatar ? (
                                        <img
                                            alt={targetUser.username}
                                            className="w-24 h-24 rounded-[32px] relative z-10 object-cover ring-4 ring-white shadow-xl"
                                            src={targetUser?.avatar}
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-[32px] relative z-10 flex flex-col items-center justify-center bg-slate-200 text-slate-500 text-3xl font-bold ring-4 ring-white shadow-xl">
                                            {targetUser?.username?.substring(0, 2).toUpperCase() || "?"}
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-1">
                                    {targetUser?.username || "Unknown"}
                                </h4>
                                <p className="text-sm font-bold text-slate-400 mb-5">
                                    @{targetUser?.username?.toLowerCase() || "unknown"}
                                </p>

                                <div
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${report.severity === "CRITICAL" || report.severity === "HIGH"
                                        ? "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-50"
                                        : "bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-50"
                                        }`}
                                >
                                    <AlertTriangle size={14} />
                                    Risk Score: {report.severity === "CRITICAL" ? "95" : report.severity === "HIGH" ? "80" : "20"}/100
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Status</span>
                                    <span className="text-sm font-black text-slate-700">Active</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prior Reports</span>
                                    <span className="text-sm font-black text-red-500">1</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">MODERATION HISTORY</h5>
                                <div className="space-y-4">
                                    <div className="flex gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <ShieldCheck size={20} className="text-slate-300" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clean history (mocked)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Moderator Quick Actions */}
                        <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-2xl shadow-indigo-200">
                            <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-6">MODERATOR ACTIONS</h4>
                            <div className="space-y-3">
                                <button className="w-full py-3.5 px-5 rounded-xl bg-indigo-800/50 border border-indigo-700/50 text-indigo-100 hover:bg-white hover:text-indigo-900 text-sm font-bold text-left flex items-center justify-between transition-all group/btn">
                                    Issue Formal Warning
                                    <ChevronRight size={18} className="text-indigo-500 group-hover/btn:text-indigo-900 transition-colors" />
                                </button>
                                <button className="w-full py-3.5 px-5 rounded-xl bg-indigo-800/50 border border-indigo-700/50 text-indigo-100 hover:bg-white hover:text-indigo-900 text-sm font-bold text-left flex items-center justify-between transition-all group/btn">
                                    Suspend User (7 days)
                                    <ChevronRight size={18} className="text-indigo-500 group-hover/btn:text-indigo-900 transition-colors" />
                                </button>
                                <button className="w-full py-3.5 px-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500 hover:text-white text-sm font-bold text-left flex items-center justify-between transition-all group/btn">
                                    Permaban User
                                    <ShieldOff size={18} className="text-red-400 group-hover/btn:text-white transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
