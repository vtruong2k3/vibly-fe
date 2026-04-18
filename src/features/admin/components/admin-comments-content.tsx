"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import adminCommentsService from "@/lib/services/admin-comments.service";
import type { AdminCommentListItem } from "@/types/admin.types";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import AdminTableSkeleton from "./admin-table-skeleton";
import AdminErrorState from "./admin-error-state";
import AdminEmptyState from "./admin-empty-state";
import ConfirmWithReasonDialog from "./confirm-with-reason-dialog";

export default function AdminCommentsContent() {
  const qc = useQueryClient();
  const [removingComment, setRemovingComment] = useState<AdminCommentListItem | null>(null);
  const [cursor, setCursor]                  = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack]        = useState<string[]>([]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.comments, cursor],
    queryFn: () => adminCommentsService.list({ cursor, limit: 30 }),
    staleTime: 30_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.comments });

  const mutateRemove = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminCommentsService.remove(id, reason),
    onSuccess: () => { invalidate(); setRemovingComment(null); },
  });

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

  const comments: AdminCommentListItem[] = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div>
              <h1 className="text-lg font-semibold text-white">Comments</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage reported and flagged comments
        </p>
      </div>

      {isError && data && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-2.5 text-xs text-orange-400">
          ⚠ Showing cached data.
          <button onClick={() => void refetch()} className="ml-auto underline">Retry</button>
        </div>
      )}
      {isError && !data && <AdminErrorState onRetry={() => void refetch()} />}

      {isLoading && !data ? (
        <AdminTableSkeleton rows={8} cols={4} />
      ) : comments.length === 0 ? (
        <AdminEmptyState message="No comments found." />
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Author</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Comment</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">Reports</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-xs font-medium">@{comment.author.username}</p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-300 text-xs truncate">{comment.content}</p>
                    <p className="text-slate-600 text-xs truncate mt-0.5">
                      in: {comment.post?.content ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-xs font-medium",
                      comment.status === "ACTIVE" ? "text-emerald-400" : "text-red-400",
                    )}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-slate-500">
                    —
                  </td>
                  <td className="px-4 py-3 text-right">
                    {comment.status === "ACTIVE" && (
                      <button
                        onClick={() => setRemovingComment(comment)}
                        className="p-1.5 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {removingComment && (
        <ConfirmWithReasonDialog
          open
          title="Remove this comment?"
          description="This comment will be soft-deleted and hidden from users."
          confirmLabel="Remove"
          destructive
          requireReason
          onConfirm={async (reason) => {
            await mutateRemove.mutateAsync({ id: removingComment.id, reason });
          }}
          onClose={() => setRemovingComment(null)}
        />
      )}
    </div>
  );
}
