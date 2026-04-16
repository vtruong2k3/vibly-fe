"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { chatService, type SendMessageDto, type CreateConversationDto } from "@/lib/services/chat.service";
import { QUERY_KEYS } from "@/lib/api/constants";
import { useSocket, type IncomingMessage } from "@/providers/socket-provider";

// ─── useConversations ─────────────────────────────────────────────────────────
export function useConversations() {
  return useQuery({
    queryKey: QUERY_KEYS.conversations,
    queryFn: () => chatService.getConversations(),
    staleTime: 30_000,
  });
}

// ─── useConversationMessages ──────────────────────────────────────────────────
export function useConversationMessages(conversationId: string | null) {
  const qc = useQueryClient();
  const { socket } = useSocket();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.messages(conversationId ?? ""),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      chatService.getMessages(conversationId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
    enabled: !!conversationId,
    staleTime: 10_000,
  });
}

// ─── useCreateConversation ────────────────────────────────────────────────────
export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateConversationDto) => chatService.createConversation(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.conversations }),
    onError: () => toast.error("Không thể tạo hộp thoại."),
  });
}

// ─── useSendMessage ───────────────────────────────────────────────────────────
export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: SendMessageDto) => chatService.sendMessage(conversationId, dto),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.messages(conversationId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
    },
  });
}
