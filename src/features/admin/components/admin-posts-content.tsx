"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, RefreshCw, EyeOff, RotateCcw, Image as ImageIcon } from "lucide-react";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminPostsService from "@/lib/services/admin-posts.service";
import type { AdminPostListItem, PostStatus } from "@/types/admin.types";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import AdminTableSkeleton from "./admin-table-skeleton";
import AdminErrorState from "./admin-error-state";
import AdminEmptyState from "./admin-empty-state";
import ConfirmWithReasonDialog from "./confirm-with-reason-dialog";

const STATUS_FILTERS: { label: string; value: PostStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Hidden", value: "HIDDEN" },
];

const POST_STATUS_CLASSES: Record<PostStatus, string> = {
  PUBLISHED: "text-emerald-400",
  HIDDEN:    "text-orange-400",
  DELETED:   "text-red-400",
};

export default function AdminPostsContent() {
  const qc = useQueryClient();
  const [search, setSearch]                 = useState("");
  const [statusFilter, setStatusFilter]     = useState<PostStatus | "ALL">("ALL");
  const [hasReportsOnly, setHasReportsOnly] = useState(false);
  const [cursor, setCursor]                = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack]      = useState<string[]>([]);
  const [removingPost, setRemovingPost]    = useState<AdminPostListItem | null>(null);
  const [restoreError, setRestoreError]    = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.posts, { search: debouncedSearch, status: statusFilter, hasReportsOnly, cursor }],
    queryFn: () => adminPostsService.list({
      keyword:    debouncedSearch || undefined,
      status:     statusFilter === "ALL" ? undefined : statusFilter,
      hasReports: hasReportsOnly || undefined,
      cursor,
      limit: 20,
    }),
    staleTime: 30_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.posts });

  const mutateRemove = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminPostsService.remove(id, reason),
    onSuccess: () => { invalidate(); setRemovingPost(null); },
  });

  const mutateRestore = useMutation({
    mutationFn: (id: string) => adminPostsService.restore(id),
    onSuccess: invalidate,
    onError: (err: any) => {
      const code = err?.response?.data?.code;
      setRestoreError(
        code === "MEDIA_ALREADY_PURGED"
          ? "Cannot restore — media files have been permanently deleted."
          : "Restore failed. Please try again.",
      );
    },
  });

  const posts = data?.data ?? [];

  const handleNext = () => {
    if (!data?.meta.nextCursor) return;
    setCursorStack((s) => [...s, cursor ?? ""]);
    setCursor(data.meta.nextCursor);
  };

  const handlePrev = () => {
    const stack = [...cursorStack];
    const prev = stack.pop();
    setCursorStack(stack);
    setCursor(prev || undefined);
  };

  const resetPagination = () => { setCursor(undefined); setCursorStack([]); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Posts</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and moderate platform posts</p>
        </div>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-600" />
          <input
            type="search"
            placeholder="Search post content or author…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPagination(); }}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => { setStatusFilter(value); resetPagination(); }}
              className={cn(
                "px-3 h-7 rounded-md text-xs font-medium transition-colors",
                statusFilter === value ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stale banner */}
      {isError && data && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-2.5 text-xs text-orange-400">
          ⚠ Showing cached data.
          <button onClick={() => void refetch()} className="ml-auto underline">Retry</button>
        </div>
      )}
      {isError && !data && <AdminErrorState onRetry={() => void refetch()} />}

      {!isError || data ? (
        isLoading && !data ? (
          <AdminTableSkeleton rows={8} cols={5} />
        ) : posts.length === 0 ? (
          <AdminEmptyState message="No posts match your filters." />
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Author</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Content</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Media</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">Reports</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white text-xs font-medium">{post.author.username}</p>
                        <p className="text-slate-600 text-xs">@{post.author.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-slate-300 text-xs truncate">{post.content}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {post._count.media > 0 && (
                        <span className="flex items-center justify-center gap-1 text-slate-500 text-xs">
                          <ImageIcon className="size-3" />
                          {post._count.media}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium", POST_STATUS_CLASSES[post.status])}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-slate-500">
                      —
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {post.status === "PUBLISHED" && (
                          <button
                            onClick={() => setRemovingPost(post)}
                            title="Remove post"
                            className="p-1.5 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <EyeOff className="size-3.5" />
                          </button>
                        )}
                        {post.status === "HIDDEN" && (
                          <button
                            onClick={() => void mutateRestore.mutate(post.id)}
                            title="Restore post"
                            className="p-1.5 rounded-md text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            <RotateCcw className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {/* Cursor pagination */}
      {(cursorStack.length > 0 || data?.meta.nextCursor) && (
        <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
          <button onClick={handlePrev} disabled={cursorStack.length === 0}
            className="px-3 h-7 rounded-md border border-white/10 hover:border-white/20 disabled:opacity-40 transition-colors">
            Prev
          </button>
          <button onClick={handleNext} disabled={!data?.meta.nextCursor}
            className="px-3 h-7 rounded-md border border-white/10 hover:border-white/20 disabled:opacity-40 transition-colors">
            Next
          </button>
        </div>
      )}

      {/* Restore error toast */}
      {restoreError && (
        <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400 flex items-center justify-between">
          {restoreError}
          <button onClick={() => setRestoreError(null)} className="text-red-400/70 hover:text-red-400">✕</button>
        </div>
      )}
      {removingPost && (
        <ConfirmWithReasonDialog
          open
          title="Remove this post?"
          description="This is a soft-remove. The post will be hidden and its media quarantined for 30 days before permanent purge."
          confirmLabel="Remove"
          destructive
          requireReason
          onConfirm={async (reason) => {
            await mutateRemove.mutateAsync({ id: removingPost.id, reason });
          }}
          onClose={() => setRemovingPost(null)}
        />
      )}
    </div>
  );
}
