"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, RefreshCw } from "lucide-react";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminUsersService from "@/lib/services/admin-users.service";
import type { AdminUserListItem, UserStatus, UserRole } from "@/types/admin.types";

import { cn } from "@/lib/utils";
import AdminErrorState from "@/features/admin/components/admin-error-state";
import AdminTableSkeleton from "@/features/admin/components/admin-table-skeleton";
import AdminEmptyState from "@/features/admin/components/admin-empty-state";
import UserRoleBadge from "@/features/admin/components/user-role-badge";
import UserStatusBadge from "@/features/admin/components/user-status-badge";
import UserActionMenu from "@/features/admin/components/user-action-menu";
import UserDetailDrawer from "@/features/admin/components/user-detail-drawer";
import { useDebounce } from "@/hooks/use-debounce";

const STATUS_FILTERS: { label: string; value: UserStatus | "ALL" }[] = [
  { label: "All",       value: "ALL" },
  { label: "Active",    value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Banned",    value: "BANNED" },
];

export default function AdminUsersContent() {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [cursor, setCursor]           = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]); // history for Prev
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      ...ADMIN_QUERY_KEYS.users,
      { search: debouncedSearch, status: statusFilter, cursor },
    ],
    queryFn: () =>
      adminUsersService.list({
        search:  debouncedSearch || undefined,
        status:  statusFilter === "ALL" ? undefined : statusFilter,
        cursor,
        limit:   20,
      }),
    staleTime: 30_000,
  });

  const handleRefetch = useCallback(() => { void refetch(); }, [refetch]);

  const handleNext = () => {
    if (!data?.meta?.nextCursor) return;
    setCursorStack((s) => [...s, cursor ?? ""]);
    setCursor(data.meta?.nextCursor ?? undefined);
  };

  const handlePrev = () => {
    const stack = [...cursorStack];
    const prev  = stack.pop();
    setCursorStack(stack);
    setCursor(prev || undefined);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCursor(undefined);
    setCursorStack([]);
  };

  const users = data?.data ?? [];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and moderate platform users
          </p>
        </div>
        <button
          onClick={handleRefetch}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs font-medium transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-600" />
          <input
            id="users-search"
            type="search"
            placeholder="Search username or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCursor(undefined);
              setCursorStack([]);
            }}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => {
                setStatusFilter(value);
                setCursor(undefined);
                setCursorStack([]);
              }}
              className={cn(
                "px-3 h-7 rounded-md text-xs font-medium transition-colors",
                statusFilter === value
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stale data warning */}
      {isError && data && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-2.5 text-xs text-orange-400">
          <span>⚠ Cannot refresh — showing last known data.</span>
          <button onClick={handleRefetch} className="ml-auto underline underline-offset-2">Retry</button>
        </div>
      )}

      {isError && !data && <AdminErrorState onRetry={handleRefetch} />}

      {/* Table */}
      {(!isError || data) && (
        isLoading && !data ? (
          <AdminTableSkeleton rows={8} cols={6} />
        ) : users.length === 0 ? (
          <AdminEmptyState message="No users match your filters." />
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">Posts</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">Reports Filed</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Last login</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="size-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-400 shrink-0 font-medium">
                          {user.username[0].toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {user.username}
                          </p>
                          <p className="text-slate-500 text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums text-xs">
                      {user._count.posts.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs">
                      <span className={cn(user._count.reportsFiled > 5 ? "text-red-400 font-medium" : "text-slate-400")}>
                        {user._count.reportsFiled}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <UserActionMenu user={user} onActionComplete={handleRefetch} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Cursor pagination */}
      {(cursorStack.length > 0 || data?.meta?.nextCursor) && (
        <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
          <button
            onClick={handlePrev}
            disabled={cursorStack.length === 0}
            className="px-3 h-7 rounded-md border border-white/10 hover:border-white/20 disabled:opacity-40 transition-colors"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={!data?.meta?.nextCursor}
            className="px-3 h-7 rounded-md border border-white/10 hover:border-white/20 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* User detail drawer */}
      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onActionComplete={handleRefetch}
      />
    </div>
  );
}
