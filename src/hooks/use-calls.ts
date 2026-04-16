"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callsService, type StartCallDto } from "@/lib/services/calls.service";
import { QUERY_KEYS } from "@/lib/api/constants";

// ─── useStartCall ─────────────────────────────────────────────────────────────
export function useStartCall() {
  return useMutation({
    mutationFn: (dto: StartCallDto) => callsService.start(dto),
    onError: () => toast.error("Could not start call."),
  });
}

// ─── useLiveKitToken — fetch token to connect to LiveKit room ─────────────────
export function useLiveKitToken(callId: string | null) {
  return useQuery({
    queryKey: ["livekit-token", callId],
    queryFn: () => callsService.getToken(callId!),
    enabled: !!callId,
    staleTime: 5 * 60 * 1000, // token valid 5 min
  });
}

// ─── useCallSession — watch call status ──────────────────────────────────────
export function useCallSession(callId: string | null) {
  return useQuery({
    queryKey: ["call-session", callId], // properly isolated key
    queryFn: () => callsService.getSession(callId!),
    enabled: !!callId,
    refetchInterval: 5_000,
  });
}

// ─── useAcceptCall ─────────────────────────────────────────────────────────────
export function useAcceptCall() {
  return useMutation({
    mutationFn: (callId: string) => callsService.accept(callId),
    onError: () => toast.error("Failed to accept call."),
  });
}

// ─── useRejectCall ─────────────────────────────────────────────────────────────
export function useRejectCall() {
  return useMutation({
    mutationFn: (callId: string) => callsService.reject(callId),
  });
}

// ─── useEndCall ───────────────────────────────────────────────────────────────
export function useEndCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (callId: string) => callsService.end(callId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["livekit-token"] });
    },
    onError: () => toast.error("Failed to end call."),
  });
}
