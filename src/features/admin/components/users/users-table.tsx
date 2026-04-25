"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    MoreHorizontal, Square, CheckSquare,
    ChevronLeft, ChevronRight, Search, Loader2,
    ShieldOff, ShieldCheck, ShieldAlert, BadgeCheck, BadgeX, RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminUsersService from "@/lib/services/admin-users.service";
import adminKycService from "@/lib/services/admin-kyc.service";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { AdminUserListItem, UserStatus, UserRole } from "@/types/admin.types";

interface UsersTableProps {
    selectedUsers: string[];
    onToggleUser: (id: string) => void;
    onSelectAll: (allIds: string[]) => void;
    onClearSelection: () => void;
}

// ── Status badge ────────────────────────────────────────────────────────────

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

// ── Reason dialog ─────────────────────────────────────────────────────────────

interface ReasonDialogProps {
    title: string;
    description: string;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isPending: boolean;
    confirmLabel?: string;
    confirmClass?: string;
}

function ReasonDialog({
    title, description, isOpen, onClose, onConfirm, isPending,
    confirmLabel = "Confirm", confirmClass = "bg-rose-600 hover:bg-rose-700 text-white",
}: ReasonDialogProps) {
    const [reason, setReason] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) { setReason(""); setTimeout(() => inputRef.current?.focus(), 100); }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
                <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 mb-4">{description}</p>
                <textarea
                    ref={inputRef}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Enter a reason..."
                    className="w-full text-sm border border-slate-200 rounded-xl p-3 outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                />
                <div className="flex gap-3 mt-4 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={!reason.trim() || isPending}
                        className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all disabled:opacity-40", confirmClass)}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Actions dropdown ──────────────────────────────────────────────────────────

interface ActionsDropdownProps {
    user: AdminUserListItem;
    onStatusChange: (id: string, status: UserStatus, reason?: string) => void;
    onToggleBadge: (id: string, grant: boolean) => void;
    isPending: boolean;
}

function ActionsDropdown({ user, onStatusChange, onToggleBadge, isPending }: ActionsDropdownProps) {
    const [open, setOpen] = useState(false);
    const [dialog, setDialog] = useState<null | "suspend" | "ban">(null);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
                <MoreHorizontal className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        className="absolute right-0 top-full mt-1 z-20 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 overflow-hidden"
                    >
                        {/* Status actions */}
                        {user.status !== "ACTIVE" && (
                            <button
                                onClick={() => { onStatusChange(user.id, "ACTIVE"); setOpen(false); }}
                                disabled={isPending}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Restore to Active
                            </button>
                        )}
                        {user.status === "ACTIVE" && (
                            <button
                                onClick={() => { setDialog("suspend"); setOpen(false); }}
                                disabled={isPending}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                                <ShieldAlert className="w-4 h-4" />
                                Suspend
                            </button>
                        )}
                        {user.status !== "BANNED" && (
                            <button
                                onClick={() => { setDialog("ban"); setOpen(false); }}
                                disabled={isPending}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                                <ShieldOff className="w-4 h-4" />
                                Permanently Ban
                            </button>
                        )}

                        <div className="h-px bg-slate-100 my-1" />

                        {/* Badge actions */}
                        {user.isVerified ? (
                            <button
                                onClick={() => { onToggleBadge(user.id, false); setOpen(false); }}
                                disabled={isPending}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <BadgeX className="w-4 h-4 text-slate-400" />
                                Revoke Verified Badge
                            </button>
                        ) : (
                            <button
                                onClick={() => { onToggleBadge(user.id, true); setOpen(false); }}
                                disabled={isPending}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50 transition-colors"
                            >
                                <BadgeCheck className="w-4 h-4" />
                                Grant Verified Badge
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dialogs */}
            <AnimatePresence>
                {dialog === "suspend" && (
                    <ReasonDialog
                        title="Suspend user"
                        description={`Suspend @${user.username}? They will be force-logged out immediately.`}
                        isOpen
                        onClose={() => setDialog(null)}
                        onConfirm={(reason) => { onStatusChange(user.id, "SUSPENDED", reason); setDialog(null); }}
                        isPending={isPending}
                        confirmLabel="Suspend"
                        confirmClass="bg-amber-500 hover:bg-amber-600 text-white"
                    />
                )}
                {dialog === "ban" && (
                    <ReasonDialog
                        title="Permanently ban user"
                        description={`This will permanently ban @${user.username} and revoke all their sessions. Requires ADMIN role.`}
                        isOpen
                        onClose={() => setDialog(null)}
                        onConfirm={(reason) => { onStatusChange(user.id, "BANNED", reason); setDialog(null); }}
                        isPending={isPending}
                        confirmLabel="Ban Permanently"
                        confirmClass="bg-rose-600 hover:bg-rose-700 text-white"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

const RowSkeleton = () => (
    <tr>
        {Array.from({ length: 7 }).map((_, i) => (
            <td key={i} className="py-5 px-6">
                <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
            </td>
        ))}
    </tr>
);

// ── Main component ────────────────────────────────────────────────────────────

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
        mutationFn: ({ id, status, reason }: { id: string; status: UserStatus; reason?: string }) =>
            adminUsersService.updateStatus(id, status, reason ?? "Admin action"),
        onSuccess: (_, { status }) => {
            queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users });
            toast.success(`User ${status.toLowerCase()} successfully`);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Action failed"),
    });

    const toggleBadge = useMutation({
        mutationFn: ({ id, grant }: { id: string; grant: boolean }) =>
            adminKycService.toggleBadge(id, grant),
        onSuccess: (_, { grant }) => {
            queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users });
            toast.success(grant ? "Verified badge granted ✓" : "Verified badge revoked");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Badge update failed"),
    });

    const isPending = updateStatus.isPending || toggleBadge.isPending;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/40">
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
                <table className="w-full text-left min-w-[800px]">
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
                            {["User", "Role", "Status", "Badge", "Joined", "Posts", "Actions"].map((h) => (
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
                                <td colSpan={8} className="py-16 text-center text-sm text-slate-400 font-medium">
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
                                                <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                                                    @{user.username}
                                                    {user.isVerified && <VerifiedBadge size="sm" />}
                                                </p>
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

                                    {/* Badge */}
                                    <td className="py-5 px-6">
                                        {user.isVerified ? (
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="w-4 h-4 text-sky-500" />
                                                <span className="text-xs font-semibold text-sky-600">Verified</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 font-medium">—</span>
                                        )}
                                    </td>

                                    {/* Joined */}
                                    <td className="py-5 px-6">
                                        <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                            {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                    </td>

                                    {/* Posts */}
                                    <td className="py-5 px-6">
                                        <span className="text-sm font-semibold text-slate-700">{user._count.posts.toLocaleString()}</span>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-5 px-6 text-right">
                                        <ActionsDropdown
                                            user={user}
                                            onStatusChange={(id, status, reason) => updateStatus.mutate({ id, status, reason })}
                                            onToggleBadge={(id, grant) => toggleBadge.mutate({ id, grant })}
                                            isPending={isPending}
                                        />
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

export type { UsersTableProps };
