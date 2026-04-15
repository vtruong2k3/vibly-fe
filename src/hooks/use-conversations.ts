"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  conversationsService,
  messagesService,
  type CreateConversationDto,
  type CreateMessageDto,
} from "@/lib/services/conversations.service";
import { QUERY_KEYS } from "@/lib/api/constants";

const DEFAULT_LIMIT = 30;

// ─── useConversationsQuery ────────────────────────────────────────────────────
export function useConversationsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.conversations,
    queryFn: () => conversationsService.list(),
    refetchInterval: 15_000, // poll until Socket.IO is wired
  });
}

// ─── useCreateConversation ────────────────────────────────────────────────────
export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateConversationDto) => conversationsService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations }),
    onError: () => toast.error("Could not start conversation."),
  });
}

// ─── useMarkConversationRead ──────────────────────────────────────────────────
export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversationsService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations }),
  });
}

// ─── useMessagesQuery — infinite scroll backwards ────────────────────────────
export function useMessagesQuery(conversationId: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.messages(conversationId),
    queryFn: ({ pageParam }) =>
      messagesService.list(conversationId, {
        cursor: pageParam as string | undefined,
        limit: DEFAULT_LIMIT,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: !!conversationId,
  });
}

// ─── useSendMessage ───────────────────────────────────────────────────────────
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMessageDto) => messagesService.send(conversationId, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages(conversationId) }),
    onError: () => toast.error("Message failed to send."),
  });
}
