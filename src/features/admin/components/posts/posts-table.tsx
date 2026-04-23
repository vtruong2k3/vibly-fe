"use client";

import { useState } from "react";
import {
    ChevronLeft, ChevronRight, MoreVertical, Flag,
    Heart, MessageSquare, FileText, Image as ImageIcon, Video,
    ExternalLink, ChevronDown, Loader2, Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminPostsService from "@/lib/services/admin-posts.service";
import type { AdminPostListItem, PostStatus } from "@/types/admin.types";

export type PostCategory = "Text" | "Photo" | "Video" | "Link";

const getPostStatus = (item: AdminPostListItem): "Active" | "Removed" | "Pending" => {
    if (item.deletedAt) return "Removed";
    if (item.status === "HIDDEN") return "Pending";
    return "Active";
};

const getStatusStyle = (displayStatus: "Active" | "Removed" | "Pending" | "Flagged") => {
    switch (displayStatus) {
        case "Active": return "bg-slate-100 text-slate-700 border-slate-200";
        case "Flagged": return "bg-rose-50 text-rose-700 border-rose-200";
        case "Removed": return "bg-slate-200 text-slate-500 border-slate-300";
        case "Pending": return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
};

const getCategoryIcon = (count: { media: number }) => {
    if (count.media > 0) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
};

const RowSkeleton = () => (
    <tr>
        {Array.from({ length: 7 }).map((_, i) => (
            <td key={i} className="px-6 py-5">
                <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
            </td>
        ))}
    </tr>
);

export function PostsTable() {
    const queryClient = useQueryClient();
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<PostStatus | "">("");
    const [hasReports, setHasReports] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: [...ADMIN_QUERY_KEYS.posts, cursor, statusFilter, hasReports, keyword],
        queryFn: () =>
            adminPostsService.list({
                cursor,
                limit: 20,
                status: statusFilter || undefined,
                hasReports: hasReports || undefined,
                keyword: keyword || undefined,
            }),
        staleTime: 30_000,
    });

    const posts = data?.data ?? [];
    const nextCursor = data?.meta.nextCursor ?? null;

    const removePost = useMutation({
        mutationFn: (id: string) => adminPostsService.remove(id, "Admin action"),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.posts }),
    });

    const restorePost = useMutation({
        mutationFn: (id: string) => adminPostsService.restore(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.posts }),
    });

    const toggleSelect = (id: string) => setSelectedPosts((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

    const toggleSelectAll = () =>
        setSelectedPosts(selectedPosts.length === posts.length ? [] : posts.map((p) => p.id));

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden outline outline-1 outline-slate-100">
            {/* Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search content..."
                            value={keyword}
                            onChange={(e) => { setKeyword(e.target.value); setCursor(undefined); }}
                            className="pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 w-48"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as any); setCursor(undefined); }}
                            className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="HIDDEN">Hidden</option>
                            <option value="DELETED">Deleted</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Has Reports toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={hasReports}
                            onChange={(e) => { setHasReports(e.target.checked); setCursor(undefined); }}
                            className="w-4 h-4 rounded accent-indigo-600"
                        />
                        <span className="text-sm font-semibold text-slate-600">Flagged only</span>
                    </label>

                    {isFetching && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                </div>

                {/* Bulk actions */}
                <AnimatePresence>
                    {selectedPosts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center gap-2"
                        >
                            <span className="text-sm font-semibold text-slate-500">{selectedPosts.length} selected:</span>
                            <button
                                onClick={() => { selectedPosts.forEach(id => removePost.mutate(id)); setSelectedPosts([]); }}
                                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold border border-rose-100 transition-all shadow-sm"
                            >
                                Remove Selected
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Table */}
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="w-12 px-6 py-4 text-center">
                                <input
                                    type="checkbox"
                                    checked={posts.length > 0 && selectedPosts.length === posts.length}
                                    onChange={toggleSelectAll}
                                    className="rounded border-slate-300 w-4 h-4 cursor-pointer accent-indigo-600"
                                />
                            </th>
                            {["Post ID", "Author", "Content Preview", "Type", "Engagement", "Status", "Actions"].map((h) => (
                                <th key={h} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                        ) : posts.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-16 text-center text-sm text-slate-400 font-medium">
                                    No posts found.
                                </td>
                            </tr>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {posts.map((post) => {
                                    const displayStatus = getPostStatus(post);
                                    const hasOpenReports = post._count?.reactions === undefined; // fallback
                                    return (
                                        <motion.tr
                                            layout
                                            key={post.id}
                                            className={cn(
                                                "hover:bg-slate-50/50 transition-colors group",
                                                displayStatus === "Removed" && "opacity-60"
                                            )}
                                        >
                                            {/* Checkbox */}
                                            <td className="px-6 py-5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPosts.includes(post.id)}
                                                    onChange={() => toggleSelect(post.id)}
                                                    className="rounded border-slate-300 w-4 h-4 cursor-pointer accent-indigo-600"
                                                />
                                            </td>

                                            {/* Post ID */}
                                            <td className="px-6 py-5 text-sm font-semibold text-slate-500">
                                                #{post.id.slice(-6).toUpperCase()}
                                            </td>

                                            {/* Author */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0">
                                                        {post.author.username.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-slate-900 font-bold truncate">@{post.author.username}</div>
                                                        <div className={cn("text-xs font-semibold", post.author.status === "ACTIVE" ? "text-emerald-500" : "text-rose-500")}>
                                                            {post.author.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Content Preview */}
                                            <td className="px-6 py-5">
                                                <p className={cn("truncate max-w-[320px] text-sm text-slate-700 font-medium", displayStatus === "Removed" && "italic text-slate-400 line-through")}>
                                                    {post.content || "[No text content]"}
                                                </p>
                                                <span className="text-xs text-slate-400 font-semibold mt-1 block">
                                                    {new Date(post.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </td>

                                            {/* Type */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-slate-600 font-medium bg-slate-50 w-max px-2.5 py-1.5 rounded-lg border border-slate-100">
                                                    {getCategoryIcon(post._count)}
                                                    <span className="text-xs">{post._count.media > 0 ? "Media" : "Text"}</span>
                                                </div>
                                            </td>

                                            {/* Engagement */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4 text-sm text-slate-500 font-semibold">
                                                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{post._count.reactions}</span>
                                                    <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" />{post._count.comments}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-5">
                                                <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md font-bold text-[11px] uppercase tracking-wider border", getStatusStyle(displayStatus))}>
                                                    {displayStatus}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {displayStatus !== "Removed" ? (
                                                        <button
                                                            onClick={() => removePost.mutate(post.id)}
                                                            disabled={removePost.isPending}
                                                            className="px-3 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg transition-colors disabled:opacity-40"
                                                        >
                                                            Remove
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => restorePost.mutate(post.id)}
                                                            disabled={restorePost.isPending}
                                                            className="px-3 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors disabled:opacity-40"
                                                        >
                                                            Restore
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/30 gap-4">
                <span className="text-sm font-semibold text-slate-500">
                    {isLoading ? "Loading..." : `Showing ${posts.length} posts`}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCursor(undefined)}
                        disabled={!cursor}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-500 disabled:opacity-50 transition-all bg-slate-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => nextCursor && setCursor(nextCursor)}
                        disabled={!nextCursor}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-500 disabled:opacity-50 transition-all bg-slate-50"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
