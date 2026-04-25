"use client";

import React, { useState } from "react";
import {
    ShieldCheck, ShieldX, ShieldOff, ChevronLeft, ChevronRight,
    Loader2, ExternalLink, XCircle, CheckCircle2, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminKycService from "@/lib/services/admin-kyc.service";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { KycRequest, VerificationStatus } from "@/types/admin.types";

// ── Status badge ─────────────────────────────────────────────────────────────

const KycStatusBadge = ({ status }: { status: VerificationStatus }) => {
    const map: Record<VerificationStatus, { cls: string; icon: React.ReactNode; label: string }> = {
        PENDING: {
            cls: "bg-amber-50 text-amber-700 border-amber-100",
            icon: <AlertCircle className="w-3 h-3" />,
            label: "Pending",
        },
        APPROVED: {
            cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
            icon: <CheckCircle2 className="w-3 h-3" />,
            label: "Approved",
        },
        REJECTED: {
            cls: "bg-rose-50 text-rose-700 border-rose-100",
            icon: <XCircle className="w-3 h-3" />,
            label: "Rejected",
        },
        REVOKED: {
            cls: "bg-slate-100 text-slate-600 border-slate-200",
            icon: <ShieldOff className="w-3 h-3" />,
            label: "Revoked",
        },
    };
    const { cls, icon, label } = map[status];
    return (
        <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border", cls)}>
            {icon}
            {label}
        </span>
    );
};

// ── Review modal ───────────────────────────────────────────────────────────────

interface ReviewModalProps {
    request: KycRequest;
    onClose: () => void;
}

function ReviewModal({ request, onClose }: ReviewModalProps) {
    const queryClient = useQueryClient();
    const [note, setNote] = useState("");
    const [activeImg, setActiveImg] = useState<string | null>(null);

    const review = useMutation({
        mutationFn: ({ decision, note }: { decision: "APPROVED" | "REJECTED" | "REVOKED"; note?: string }) =>
            adminKycService.review(request.id, { decision, note }),
        onSuccess: (_, { decision }) => {
            queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.kyc });
            toast.success(`KYC request ${decision.toLowerCase()} ✓`);
            onClose();
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Review failed"),
    });

    const docs = [
        { label: "Front of ID", url: request.frontDocUrl },
        ...(request.backDocUrl ? [{ label: "Back of ID", url: request.backDocUrl }] : []),
        { label: "Selfie", url: request.selfieUrl },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">KYC Review</p>
                            <h3 className="text-lg font-bold text-slate-900">
                                @{request.user.username}
                                {request.user.isVerified && <VerifiedBadge size="sm" className="ml-2 inline-flex" />}
                            </h3>
                            <p className="text-sm text-slate-500">{request.user.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <KycStatusBadge status={request.status} />
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-100">
                    <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Legal Name</p>
                        <p className="text-sm font-bold text-slate-900">{request.legalName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase mb-1">ID Type</p>
                        <p className="text-sm font-bold text-slate-900">{request.idType}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Submitted</p>
                        <p className="text-sm text-slate-700">{new Date(request.submittedAt).toLocaleString()}</p>
                    </div>
                    {request.reviewer && (
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Reviewed By</p>
                            <p className="text-sm text-slate-700">@{request.reviewer.username}</p>
                        </div>
                    )}
                    {request.reviewNote && (
                        <div className="col-span-2">
                            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Review Note</p>
                            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{request.reviewNote}</p>
                        </div>
                    )}
                </div>

                {/* Documents */}
                <div className="p-6 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Documents</p>
                    <div className="grid grid-cols-3 gap-3">
                        {docs.map(({ label, url }) => (
                            <button
                                key={label}
                                onClick={() => setActiveImg(url)}
                                className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 hover:border-indigo-300 transition-all"
                            >
                                <img src={url} alt={label} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold text-white bg-black/50 rounded px-1.5 py-0.5">
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions (only for PENDING) */}
                {request.status === "PENDING" && (
                    <div className="p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Review Note (required for rejection)</p>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Optional note — required when rejecting..."
                            className="w-full text-sm border border-slate-200 rounded-xl p-3 outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all mb-4"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    if (!note.trim()) return toast.error("A note is required to reject");
                                    review.mutate({ decision: "REJECTED", note });
                                }}
                                disabled={review.isPending}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-colors disabled:opacity-40"
                            >
                                {review.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldX className="w-4 h-4" />}
                                Reject
                            </button>
                            <button
                                onClick={() => review.mutate({ decision: "APPROVED", note: note || undefined })}
                                disabled={review.isPending}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-40 shadow-md shadow-emerald-200"
                            >
                                {review.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                Approve & Grant Badge
                            </button>
                        </div>
                    </div>
                )}

                {/* REVOKE for approved */}
                {request.status === "APPROVED" && (
                    <div className="p-6">
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder="Reason for revocation..."
                            className="w-full text-sm border border-slate-200 rounded-xl p-3 outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all mb-4"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    if (!note.trim()) return toast.error("A reason is required to revoke");
                                    review.mutate({ decision: "REVOKED", note });
                                }}
                                disabled={review.isPending}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                <ShieldOff className="w-4 h-4" />
                                Revoke Verification
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Lightbox */}
            <AnimatePresence>
                {activeImg && (
                    <motion.div
                        key="lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setActiveImg(null)}
                    >
                        <img src={activeImg} alt="Document view" className="max-w-full max-h-full rounded-xl shadow-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── KYC item row ──────────────────────────────────────────────────────────────

function KycRow({ request, onClick }: { request: KycRequest; onClick: () => void }) {
    return (
        <motion.tr
            layout
            onClick={onClick}
            className="group cursor-pointer hover:bg-slate-50/70 transition-colors border-b border-slate-50 last:border-0"
        >
            <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                        {request.user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            @{request.user.username}
                            {request.user.isVerified && <VerifiedBadge size="sm" />}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{request.user.email}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-6">
                <span className="text-sm text-slate-700 font-medium">{request.legalName}</span>
            </td>
            <td className="py-4 px-6">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg px-2 py-1">{request.idType}</span>
            </td>
            <td className="py-4 px-6">
                <KycStatusBadge status={request.status} />
            </td>
            <td className="py-4 px-6">
                <span className="text-xs text-slate-500">
                    {new Date(request.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
            </td>
            <td className="py-4 px-6 text-right">
                <span className="text-xs font-semibold text-indigo-500 group-hover:text-indigo-700 transition-colors">
                    Review →
                </span>
            </td>
        </motion.tr>
    );
}

// ── Main content ──────────────────────────────────────────────────────────────

export default function AdminKycContent() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<VerificationStatus | "">("");
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [selected, setSelected] = useState<KycRequest | null>(null);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: [...ADMIN_QUERY_KEYS.kyc, cursor, statusFilter],
        queryFn: () =>
            adminKycService.list({
                status: statusFilter || undefined,
                cursor,
                limit: 25,
            }),
        staleTime: 20_000,
    });

    const requests = data?.data ?? [];
    const nextCursor = data?.meta.nextCursor ?? null;

    const stats: Record<VerificationStatus, number> = requests.reduce(
        (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
        { PENDING: 0, APPROVED: 0, REJECTED: 0, REVOKED: 0 } as Record<VerificationStatus, number>,
    );

    return (
        <div className="p-4 lg:p-8 overflow-y-auto w-full max-w-[1400px] mx-auto min-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">KYC Verification</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Review identity verification requests from users</p>
                </motion.div>
                {isFetching && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {(["PENDING", "APPROVED", "REJECTED", "REVOKED"] as VerificationStatus[]).map((s) => {
                    const cfg: Record<VerificationStatus, { label: string; icon: React.ReactNode; color: string }> = {
                        PENDING: { label: "Pending", icon: <AlertCircle className="w-4 h-4" />, color: "text-amber-600 bg-amber-50" },
                        APPROVED: { label: "Approved", icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-50" },
                        REJECTED: { label: "Rejected", icon: <XCircle className="w-4 h-4" />, color: "text-rose-600 bg-rose-50" },
                        REVOKED: { label: "Revoked", icon: <ShieldOff className="w-4 h-4" />, color: "text-slate-600 bg-slate-100" },
                    };
                    const { label, icon, color } = cfg[s];
                    return (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setCursor(undefined); }}
                            className={cn(
                                "bg-white rounded-2xl border p-4 text-left transition-all hover:shadow-md active:scale-[0.98]",
                                statusFilter === s ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200",
                            )}
                        >
                            <div className={cn("inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold mb-2", color)}>
                                {icon}
                                {label}
                            </div>
                            <p className="text-2xl font-black text-slate-900">{stats[s]}</p>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">All Requests</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value as any); setCursor(undefined); }}
                        className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="REVOKED">Revoked</option>
                    </select>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {["User", "Legal Name", "ID Type", "Status", "Submitted", ""].map((h) => (
                                    <th key={h} className="py-4 px-6 text-xs font-bold text-slate-400 tracking-widest uppercase italic whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="py-4 px-6">
                                                <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-medium">
                                        No KYC requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((r) => (
                                    <KycRow key={r.id} request={r} onClick={() => setSelected(r)} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                    <span className="text-xs font-bold text-slate-400 uppercase italic tracking-wide">
                        {isLoading ? "Loading..." : `Showing ${requests.length} requests`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCursor(undefined)}
                            disabled={!cursor}
                            className="p-2 border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:bg-white transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => nextCursor && setCursor(nextCursor)}
                            disabled={!nextCursor}
                            className="p-2 border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:bg-white transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Review modal */}
            <AnimatePresence>
                {selected && (
                    <ReviewModal
                        key={selected.id}
                        request={selected}
                        onClose={() => setSelected(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
