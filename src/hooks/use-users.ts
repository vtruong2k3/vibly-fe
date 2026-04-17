"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersService, type UpdateProfileDto } from "@/lib/services/users.service";
import { friendshipsService, type SendFriendRequestDto } from "@/lib/services/friendships.service";
import { QUERY_KEYS } from "@/lib/api/constants";

// ─── useMe — current authenticated user ──────────────────────────────────────
export function useMe({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: () => usersService.getMe(),
    staleTime: 5 * 60 * 1000, // 5 min — user data doesn't change often
    enabled,
  });
}

// ─── useUserProfile — any user's public profile ──────────────────────────────
export function useUserProfile(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userProfile(id),
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  });
}

// ─── useUserPosts — any user's public posts ──────────────────────────────────
export function useUserPosts(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.userPosts(userId || ""),
    queryFn: ({ pageParam }) =>
      usersService.getUserPosts(userId!, { cursor: pageParam as string | undefined, limit: 10 }),
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: !!userId,
  });
}

// ─── useUpdateProfile ─────────────────────────────────────────────────────────
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => usersService.updateProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me });
      // Invalidate all user profiles so the updated user profile page refetches immediately
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile."),
  });
}

// ─── useSearchUsers ───────────────────────────────────────────────────────────
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: () => usersService.searchUsers({ q: query }),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}

// ─── useSendFriendRequest ─────────────────────────────────────────────────────
export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SendFriendRequestDto) => friendshipsService.sendRequest(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRequests });
      toast.success("Friend request sent!");
    },
    onError: () => toast.error("Failed to send friend request."),
  });
}

// ─── useFriendRequests ────────────────────────────────────────────────────────
export function useFriendRequests() {
  return useQuery({
    queryKey: QUERY_KEYS.friendRequests,
    queryFn: () => friendshipsService.listRequests(),
    refetchInterval: 30_000,
  });
}

// ─── useAcceptFriendRequest ───────────────────────────────────────────────────
export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendshipsService.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRequests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
      toast.success("Friend request accepted!");
    },
    onError: () => toast.error("Failed to accept request."),
  });
}

// ─── useRejectFriendRequest ───────────────────────────────────────────────────
export function useRejectFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendshipsService.rejectRequest(requestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRequests }),
    onError: () => toast.error("Failed to reject request."),
  });
}

// ─── useBlockUser ─────────────────────────────────────────────────────────────
export function useBlockUser() {
  return useMutation({
    mutationFn: (userId: string) => friendshipsService.blockUser(userId),
    onSuccess: () => toast.success("User blocked."),
    onError: () => toast.error("Failed to block user."),
  });
}
