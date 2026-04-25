"use client";

import React, { useState, useRef } from "react";
import {
    Upload, X, CheckCircle2, Clock, XCircle, ShieldOff,
    ShieldCheck, Loader2, FileUp, AlertCircle, RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QUERY_KEYS, ENDPOINTS } from "@/lib/api/constants";
import verificationService, { type SubmitKycDto } from "@/lib/services/verification.service";
import type { VerificationStatus } from "@/types/admin.types";
import apiClient from "@/lib/api/axios";
import { VerifiedBadge } from "@/components/ui/verified-badge";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COPY: Record<
    VerificationStatus,
    { label: string; color: string; bg: string; icon: React.ReactNode; description: string }
> = {
    PENDING: {
        label: "Đang chờ duyệt",
        color: "text-amber-700",
        bg: "bg-amber-50 border-amber-200",
        icon: <Clock className="w-5 h-5 text-amber-500" />,
        description:
            "Hồ sơ của bạn đã được gửi thành công. Chúng tôi sẽ xét duyệt trong vòng 1–3 ngày làm việc.",
    },
    APPROVED: {
        label: "Đã xác minh",
        color: "text-emerald-700",
        bg: "bg-emerald-50 border-emerald-200",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        description: "Tài khoản của bạn đã được xác minh và nhận Tick xanh.",
    },
    REJECTED: {
        label: "Bị từ chối",
        color: "text-rose-700",
        bg: "bg-rose-50 border-rose-200",
        icon: <XCircle className="w-5 h-5 text-rose-500" />,
        description: "Yêu cầu xác minh đã bị từ chối. Vui lòng kiểm tra ghi chú và nộp lại.",
    },
    REVOKED: {
        label: "Đã thu hồi",
        color: "text-slate-700",
        bg: "bg-slate-100 border-slate-200",
        icon: <ShieldOff className="w-5 h-5 text-slate-400" />,
        description: "Verifikasi Anda telah dicabut oleh admin. Lihat catatan di bawah untuk detail.",
    },
};

const ID_TYPES = ["CCCD/CMND", "Hộ chiếu", "Bằng lái xe"] as const;

// ── File upload zone ──────────────────────────────────────────────────────────

interface UploadZoneProps {
    label: string;
    hint: string;
    value: string;
    onChange: (url: string) => void;
    required?: boolean;
}

function UploadZone({ label, hint, value, onChange, required }: UploadZoneProps) {
    const [uploading, setUploading] = useState(false);
    const [drag, setDrag] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const upload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước tối đa 5MB.");
            return;
        }
        setUploading(true);
        try {
            // 1. Get presigned URL
            const { data: presign } = await apiClient.post<{ uploadUrl: string; mediaId: string; publicUrl: string }>(
                ENDPOINTS.media.presignedUrl,
                { contentType: file.type, fileName: file.name, entityType: "kyc_document" },
            );
            // 2. Upload to S3
            await fetch(presign.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
            // 3. Confirm
            await apiClient.patch(ENDPOINTS.media.confirm(presign.mediaId));
            onChange(presign.publicUrl);
            toast.success("Tải lên thành công ✓");
        } catch {
            toast.error("Tải lên thất bại. Vui lòng thử lại.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <p className="text-xs text-slate-500 -mt-1">{hint}</p>

            {value ? (
                <div className="relative group rounded-2xl overflow-hidden border border-emerald-200 aspect-video bg-slate-100">
                    <img src={value} alt={label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <button
                            onClick={() => onChange("")}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                            <X className="w-3.5 h-3.5" />
                            Thay ảnh
                        </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-lg p-1">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); const file = e.dataTransfer.files[0]; if (file) upload(file); }}
                    disabled={uploading}
                    className={cn(
                        "w-full aspect-video flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer disabled:opacity-50",
                        drag ? "border-indigo-400 bg-indigo-50 scale-[1.01]" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50",
                    )}
                >
                    {uploading ? (
                        <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                    ) : (
                        <FileUp className="w-7 h-7 text-slate-300" />
                    )}
                    <span className="text-sm font-semibold text-slate-500">
                        {uploading ? "Đang tải lên…" : "Kéo thả hoặc click để chọn ảnh"}
                    </span>
                    <span className="text-xs text-slate-400">JPEG / PNG / WEBP · tối đa 5MB</span>
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
            />
        </div>
    );
}

// ── Status banner ─────────────────────────────────────────────────────────────

function StatusBanner({ status, reviewNote, legalName, submittedAt }:
    { status: VerificationStatus; reviewNote?: string | null; legalName: string; submittedAt: string }) {
    const cfg = STATUS_COPY[status];

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-2xl border p-5 mb-8 flex gap-4 items-start", cfg.bg)}
        >
            <div className="mt-0.5">{cfg.icon}</div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn("font-bold text-base", cfg.color)}>{cfg.label}</p>
                    {status === "APPROVED" && <VerifiedBadge size="md" />}
                </div>
                <p className="text-sm text-slate-600 mt-1">{cfg.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 font-medium">
                    <span>Tên pháp lý: <strong className="text-slate-700">{legalName}</strong></span>
                    <span>Nộp ngày: <strong className="text-slate-700">{new Date(submittedAt).toLocaleDateString("vi-VN")}</strong></span>
                </div>
                {reviewNote && (
                    <div className="mt-3 bg-white/70 rounded-xl px-4 py-3 text-sm text-slate-700 border border-white">
                        <span className="font-semibold text-slate-500 uppercase text-xs mr-2">Ghi chú:</span>
                        {reviewNote}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ── Main Form ─────────────────────────────────────────────────────────────────

export default function VerificationForm() {
    const queryClient = useQueryClient();

    const { data: currentStatus, isLoading } = useQuery({
        queryKey: QUERY_KEYS.myVerification,
        queryFn: verificationService.getMyStatus,
        staleTime: 60_000,
    });

    const [form, setForm] = useState<Partial<SubmitKycDto>>({});

    const submit = useMutation({
        mutationFn: (dto: SubmitKycDto) => verificationService.submit(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myVerification });
            toast.success("Hồ sơ KYC đã gửi thành công! Chúng tôi sẽ xét duyệt sớm.");
            setForm({});
        },
        onError: (err: any) =>
            toast.error(err?.response?.data?.message ?? "Gửi hồ sơ thất bại. Vui lòng thử lại."),
    });

    const canResubmit = currentStatus?.status === "REJECTED" || currentStatus?.status === "REVOKED";
    const showForm = !currentStatus || canResubmit;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { legalName, idType, frontDocUrl, selfieUrl } = form;
        if (!legalName?.trim()) return toast.error("Vui lòng nhập tên pháp lý.");
        if (!idType) return toast.error("Vui lòng chọn loại giấy tờ.");
        if (!frontDocUrl) return toast.error("Vui lòng tải ảnh mặt trước giấy tờ.");
        if (!selfieUrl) return toast.error("Vui lòng tải ảnh selfie.");
        submit.mutate({ legalName: legalName.trim(), idType, frontDocUrl, backDocUrl: form.backDocUrl, selfieUrl });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Xác minh tài khoản</h2>
                    <p className="text-sm text-slate-500">Xác minh để nhận Tick xanh, nâng cao độ tin cậy.</p>
                </div>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                    { step: "1", title: "Nộp hồ sơ", desc: "Tải ảnh giấy tờ & selfie" },
                    { step: "2", title: "Xét duyệt", desc: "Admin duyệt trong 1–3 ngày" },
                    { step: "3", title: "Nhận Tick xanh", desc: "Hiển thị trên profile & bài đăng" },
                ].map(({ step, title, desc }) => (
                    <div key={step} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                        <div className="w-7 h-7 bg-sky-100 text-sky-700 font-black text-sm rounded-full flex items-center justify-center mx-auto mb-2">
                            {step}
                        </div>
                        <p className="text-sm font-bold text-slate-800">{title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                ))}
            </div>

            {/* Status banner */}
            <AnimatePresence mode="wait">
                {currentStatus && (
                    <StatusBanner
                        key={currentStatus.status}
                        status={currentStatus.status}
                        reviewNote={currentStatus.reviewNote}
                        legalName={currentStatus.legalName}
                        submittedAt={currentStatus.submittedAt}
                    />
                )}
            </AnimatePresence>

            {/* Re-submit prompt */}
            {canResubmit && (
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-rose-600">
                    <RotateCcw className="w-4 h-4" />
                    Bạn có thể nộp lại hồ sơ mới bên dưới.
                </div>
            )}

            {/* Form */}
            {showForm && (
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >
                    {/* Legal Name */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                            Tên pháp lý <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={form.legalName ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1">Nhập đúng như trên giấy tờ tùy thân.</p>
                    </div>

                    {/* ID Type */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                            Loại giấy tờ <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ID_TYPES.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, idType: t }))}
                                    className={cn(
                                        "px-4 py-2 text-sm font-semibold rounded-xl border transition-all",
                                        form.idType === t
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300",
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Document images */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <UploadZone
                            label="Ảnh mặt trước"
                            hint="Ảnh rõ nét, không bị che khuất, không mờ"
                            value={form.frontDocUrl ?? ""}
                            onChange={(url) => setForm((f) => ({ ...f, frontDocUrl: url }))}
                            required
                        />
                        <UploadZone
                            label="Ảnh mặt sau (tuỳ chọn)"
                            hint="Để trống nếu giấy tờ không có mặt sau"
                            value={form.backDocUrl ?? ""}
                            onChange={(url) => setForm((f) => ({ ...f, backDocUrl: url }))}
                        />
                    </div>

                    {/* Selfie */}
                    <UploadZone
                        label="Ảnh selfie cầm giấy tờ"
                        hint="Khuôn mặt và giấy tờ cùng xuất hiện trong ảnh, ánh sáng rõ"
                        value={form.selfieUrl ?? ""}
                        onChange={(url) => setForm((f) => ({ ...f, selfieUrl: url }))}
                        required
                    />

                    {/* Privacy note */}
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Thông tin hồ sơ của bạn được bảo mật và chỉ được xem xét bởi đội ngũ admin. Chúng tôi không chia sẻ dữ liệu cá nhân với bên thứ ba.
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={submit.isPending}
                            className="flex items-center gap-2.5 px-7 py-3 bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-sky-200 disabled:opacity-50"
                        >
                            {submit.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            {submit.isPending ? "Đang gửi…" : "Gửi hồ sơ xác minh"}
                        </button>
                    </div>
                </motion.form>
            )}

            {/* Approved state: show badge info */}
            {currentStatus?.status === "APPROVED" && !canResubmit && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-center py-8"
                >
                    <VerifiedBadge size="lg" className="mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500">
                        Tick xanh đang hiển thị trên profile và mỗi bài đăng của bạn.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
