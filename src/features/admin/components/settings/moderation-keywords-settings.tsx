"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminModerationService from "@/lib/services/admin-moderation.service";
import type { AdminKeywordListItem, ReportSeverity } from "@/types/admin.types";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<ReportSeverity, string> = {
    LOW: "bg-slate-100 text-slate-600 border-slate-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
    HIGH: "bg-orange-50 text-orange-700 border-orange-100",
    CRITICAL: "bg-rose-50 text-rose-700 border-rose-100",
};

export function ModerationKeywordsSettings() {
    const queryClient = useQueryClient();
    const [newKeyword, setNewKeyword] = useState("");
    const [newSeverity, setNewSeverity] = useState<ReportSeverity>("HIGH");

    const { data: keywords = [], isLoading, isError } = useQuery({
        queryKey: ADMIN_QUERY_KEYS.moderationKeywords,
        queryFn: adminModerationService.listKeywords,
        staleTime: 60_000,
    });

    const addMutation = useMutation({
        mutationFn: () => adminModerationService.addKeyword(newKeyword.trim(), newSeverity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.moderationKeywords });
            setNewKeyword("");
        },
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => adminModerationService.removeKeyword(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.moderationKeywords }),
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;
        addMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-bold text-slate-900">Auto-Moderation Keywords</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    Posts containing these keywords will be automatically flagged or blocked.
                </p>
            </div>

            {isError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold">
                    <AlertCircle size={15} /> Failed to load keywords.
                </div>
            )}

            {/* Add new keyword form */}
            <form onSubmit={handleAdd} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1.5">
                    <label className="text-sm font-semibold text-slate-600">New Keyword</label>
                    <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="e.g. spam, scam, phishing..."
                        className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-600">Severity</label>
                    <select
                        value={newSeverity}
                        onChange={(e) => setNewSeverity(e.target.value as ReportSeverity)}
                        className="px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={!newKeyword.trim() || addMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-40 self-end"
                >
                    {addMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    Add
                </button>
            </form>

            <hr className="border-slate-100" />

            {/* Keywords list */}
            {keywords.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No keywords configured yet.</p>
            ) : (
                <div className="space-y-2">
                    {keywords.map((kw: AdminKeywordListItem) => (
                        <div key={kw.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-slate-100/60 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border shrink-0", SEVERITY_STYLES[kw.severity])}>
                                    {kw.severity}
                                </span>
                                <span className="font-mono text-sm font-semibold text-slate-900 truncate">{kw.keyword}</span>
                                <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                                    Added by @{kw.creator.username}
                                </span>
                            </div>
                            <button
                                onClick={() => removeMutation.mutate(kw.id)}
                                disabled={removeMutation.isPending}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-40"
                                title="Remove keyword"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
