"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { friendshipsService, type SendFriendRequestDto } from "@/lib/services/friendships.service";
import { QUERY_KEYS } from "@/lib/api/constants";
import { usePresenceStore } from "@/store/presence.store";

// ─── useFriends ───────────────────────────────────────────────────────────────
export function useFriends() {
  return useQuery({
    queryKey: QUERY_KEYS.friends,
    queryFn: () => friendshipsService.listFriends({}).then((r) => {
      const raw = r?.data ?? r;
      const friendsArray = Array.isArray(raw) ? raw : [];
      
      // Seed presence store with friends' presence data
      const presenceUpdates: Record<string, any> = {};
      friendsArray.forEach((f: any) => {
        if (f.user?.presence) {
          presenceUpdates[f.user.id] = f.user.presence;
        } else if (f.user && typeof f.user.isOnline !== 'undefined') {
          presenceUpdates[f.user.id] = { isOnline: f.user.isOnline, lastSeenAt: f.user.lastSeenAt ?? null };
        }
      });
      if (Object.keys(presenceUpdates).length > 0) {
        usePresenceStore.getState().bulkUpdate(presenceUpdates);
      }

      return friendsArray;
    }),
    staleTime: 60_000,
  });
}

// ─── useFriendRequests ────────────────────────────────────────────────────────
export function useFriendRequests() {
  return useQuery({
    queryKey: QUERY_KEYS.friendRequests,
    queryFn: () => friendshipsService.listRequests().then((r) => {
      const raw = r?.data ?? r;
      return Array.isArray(raw) ? raw : [];
    }),
    staleTime: 30_000,
    refetchInterval: 30_000, // poll every 30s for new requests
  });
}

// ─── useSendFriendRequest ────────────────────────────────────────────────────
export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SendFriendRequestDto) => friendshipsService.sendRequest(dto),

    // Flip the button immediately before API responds
    onMutate: async (dto) => {
      await qc.cancelQueries({ queryKey: ["friendship-status", dto.addresseeId] });
      const prev = qc.getQueryData(["friendship-status", dto.addresseeId]);
      qc.setQueryData(["friendship-status", dto.addresseeId], {
        status: "pending_outgoing",
        requestId: null, // real requestId will come after refetch
      });
      return { prev, addresseeId: dto.addresseeId };
    },

    onSuccess: (data, variables) => {
      toast.success("Đã gửi lời mời kết bạn!");
      // Update with real requestId from server response
      qc.setQueryData(["friendship-status", variables.addresseeId], {
        status: "pending_outgoing",
        requestId: (data as { id?: string })?.id ?? null,
      });
    },

    onError: (_err, _vars, ctx) => {
      // Rollback on failure
      if (ctx) qc.setQueryData(["friendship-status", ctx.addresseeId], ctx.prev);
      toast.error("Không thể gửi lời mời kết bạn.");
    },
  });
}

// ─── useAcceptRequest ─────────────────────────────────────────────────────────
export function useAcceptRequest(requesterId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendshipsService.acceptRequest(requestId),
    onSuccess: () => {
      toast.success("Đã chấp nhận lời mời kết bạn!");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.friends });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.friendRequests });
      if (requesterId) qc.invalidateQueries({ queryKey: ["friendship-status", requesterId] });
    },
    onError: () => toast.error("Không thể chấp nhận lời mời."),
  });
}

// ─── useRejectRequest ─────────────────────────────────────────────────────────
export function useRejectRequest(requesterId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendshipsService.rejectRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.friendRequests });
      if (requesterId) qc.invalidateQueries({ queryKey: ["friendship-status", requesterId] });
    },
  });
}

// ─── useCancelRequest ─────────────────────────────────────────────────────────
export function useCancelRequest(addresseeId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendshipsService.cancelRequest(requestId),
    onSuccess: () => {
      toast.success("Đã thu hồi lời mời kết bạn.");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.friendRequests });
      if (addresseeId) qc.invalidateQueries({ queryKey: ["friendship-status", addresseeId] });
    },
    onError: () => toast.error("Không thể thu hồi lời mời."),
  });
}

// ─── useRemoveFriend ─────────────────────────────────────────────────────────
export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendshipsService.removeFriend(userId),
    onSuccess: (_, variables) => {
      toast.success("Đã huỷ kết bạn.");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.friends });
      qc.invalidateQueries({ queryKey: ["friendship-status", variables] });
    },
  });
}

// ─── useFriendshipStatus — check if targetUserId is a friend ──────────────────
export function useFriendshipStatus(targetUserId: string | undefined) {
  const query = useQuery({
    queryKey: ["friendship-status", targetUserId],
    queryFn: () => targetUserId ? friendshipsService.getStatus(targetUserId) : null,
    enabled: !!targetUserId,
    staleTime: 5000,
  });

  return {
    // While loading, use undefined to distinguish "unknown" from "none"
    status: query.isLoading ? undefined : (query.data?.status ?? "none"),
    requestId: query.data?.requestId ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
