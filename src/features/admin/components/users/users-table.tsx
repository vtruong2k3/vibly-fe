"use client";

import React, { useState } from "react";
import {
    MoreHorizontal, Square, CheckSquare,
    ChevronLeft, ChevronRight, Search, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminUsersService from "@/lib/services/admin-users.service";
import type { AdminUserListItem, UserStatus, UserRole } from "@/types/admin.types";

// --- Props interface (for external selection management) ---

interface UsersTableProps {
    selectedUsers: string[];
    onToggleUser: (id: string) => void;
    onSelectAll: (allIds: string[]) => void;
    onClearSelection: () => void;
}

// --- Status / Role badge helpers ---

const StatusBadge = ({ status }: { status: UserStatus }) => {
    const styles: Record<UserStatus, string> = {
        ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
        SUSPENDED: "bg-amber-50 text-amber-700 border-amber-100",
        BANNED: "bg-rose-50 text-rose-700 border-rose-100",
        DELETED: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[status])}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    );
};

// --- Row skeleton ---

const RowSkeleton = () => (
    <tr>
        {Array.from({ length: 6 }).map((_, i) => (
            <td key={i} className="py-5 px-6">
                <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse" />
            </td>
        ))}
    </tr>
);

// --- Main Component ---

export const UsersTable: React.FC<UsersTableProps> = ({
    selectedUsers, onToggleUser, onSelectAll, onClearSelection,
}) => {
    const queryClient = useQueryClient();

    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "">("");

    const { data, isLoading, isFetching } = useQuery({
        queryKey: [...ADMIN_QUERY_KEYS.users, cursor, search, statusFilter, roleFilter],
        queryFn: () =>
            adminUsersService.list({
                cursor,
                limit: 20,
                search: search || undefined,
                status: statusFilter || undefined,
                role: roleFilter || undefined,
            }),
        staleTime: 30_000,
    });

    const users = data?.data ?? [];
    const nextCursor = data?.meta.nextCursor ?? null;
    const allSelected = users.length > 0 && selectedUsers.length === users.length;

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
            adminUsersService.updateStatus(id, status, "Admin action"),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users }),
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/40">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCursor(undefined); }}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                    />
                </div>
                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as any); setCursor(undefined); }}
                    className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BANNED">Banned</option>
                </select>
                {/* Role filter */}
                <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value as any); setCursor(undefined); }}
                    className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                    <option value="">All Roles</option>
                    <option value="USER">User</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                </select>
                {isFetching && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin self-center ml-1" />}
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="py-5 px-6 w-12">
                                <button
                                    onClick={() => allSelected ? onClearSelection() : onSelectAll(users.map(u => u.id))}
                                    className={cn("transition-colors", allSelected ? "text-indigo-600" : "text-slate-300 hover:text-slate-400")}
                                >
                                    {allSelected ? <CheckSquare className="w-5 h-5 fill-indigo-100" /> : <Square className="w-5 h-5" />}
                                </button>
                            </th>
                            {["User", "Role", "Status", "Joined", "Posts", "Actions"].map((h) => (
                                <th key={h} className="py-5 px-6 text-xs font-bold text-slate-400 tracking-widest uppercase italic whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-16 text-center text-sm text-slate-400 font-medium">
                                    No users found.
                                </td>
                            </tr>
                        ) : users.map((user) => {
                            const isSelected = selectedUsers.includes(user.id);
                            return (
                                <motion.tr
                                    key={user.id}
                                    layout
                                    className={cn("group transition-colors", isSelected ? "bg-indigo-50/30" : "hover:bg-slate-50/50")}
                                >
                                    {/* Checkbox */}
                                    <td className="py-5 px-6">
                                        <button
                                            onClick={() => onToggleUser(user.id)}
                                            className={cn("transition-colors", isSelected ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400")}
                                        >
                                            {isSelected ? <CheckSquare className="w-5 h-5 fill-indigo-100" /> : <Square className="w-5 h-5" />}
                                        </button>
                                    </td>

                                    {/* User */}
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-4">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-50 shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                                                    {user.username.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">@{user.username}</p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="py-5 px-6">
                                        <span className={cn("text-sm font-medium", user.role === "ADMIN" ? "text-indigo-600 font-bold" : "text-slate-600")}>
                                            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="py-5 px-6"><StatusBadge status={user.status} /></td>

                                    {/* Joined */}
                                    <td className="py-5 px-6">
                                        <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                            {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                    </td>

                                    {/* Posts count */}
                                    <td className="py-5 px-6">
                                        <span className="text-sm font-semibold text-slate-700">{user._count.posts.toLocaleString()}</span>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-5 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {user.status === "ACTIVE" && (
                                                <button
                                                    onClick={() => updateStatus.mutate({ id: user.id, status: "SUSPENDED" })}
                                                    disabled={updateStatus.isPending}
                                                    className="px-3 py-1 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg transition-colors disabled:opacity-40"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            {user.status === "SUSPENDED" && (
                                                <button
                                                    onClick={() => updateStatus.mutate({ id: user.id, status: "ACTIVE" })}
                                                    disabled={updateStatus.isPending}
                                                    className="px-3 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors disabled:opacity-40"
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/20 gap-4">
                <span className="text-xs font-bold text-slate-400 tracking-wide uppercase italic">
                    {isLoading ? "Loading..." : `Showing ${users.length} users`}
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
    );
};

// Re-export types for parent usage
export type { UsersTableProps };
