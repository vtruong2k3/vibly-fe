"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSocket } from "@/providers/socket-provider";
import { useChatStore } from "@/store/chat.store";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/api/constants";
import { SOCKET_EVENTS } from "@/lib/constants/socket-events";
import { useAuthStore } from "@/store/auth.store";
import { useConversationsQuery } from "@/hooks/use-conversations";
import { useCallStore } from "@/store/call.store";
import { IncomingCallModal } from "@/features/chat/components/incoming-call-modal";
import { GlobalCallOverlay } from "@/features/calls/components/global-call-overlay";
import { useNotificationStore } from "@/store/notifications.store";
import { usePresenceStore, type UserPresence } from "@/store/presence.store";

export function GlobalChatProvider({ children }: { children: React.ReactNode }) {
  const { socket, joinConversation } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const { openConversation, openConversationIds } = useChatStore();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);

  // Lấy sẵn danh sách hộp thoại của user
  const { data: conversationsData } = useConversationsQuery();

  // Tự động JOIN vào tất cả các phòng Chat và Sync Presence
  useEffect(() => {
    if (!socket || !conversationsData) return;
    const conversationsArray = Array.isArray(conversationsData)
      ? conversationsData
      : (conversationsData as any)?.data ?? (conversationsData as any)?.conversations ?? [];

    // Seed presence store with the data from conversations API
    const presenceUpdates: Record<string, UserPresence> = {};

    conversationsArray.forEach((conv: any) => {
      joinConversation(conv.id);

      // Update global presence state
      if (conv.members) {
        conv.members.forEach((m: any) => {
          if (m.user && m.user.presence) {
            presenceUpdates[m.user.id] = m.user.presence;
          } else if (m.user && typeof m.user.isOnline !== 'undefined') {
            presenceUpdates[m.user.id] = { isOnline: m.user.isOnline, lastSeenAt: m.user.lastSeenAt ?? null };
          }
        });
      }
    });

    if (Object.keys(presenceUpdates).length > 0) {
      usePresenceStore.getState().bulkUpdate(presenceUpdates);
    }
  }, [socket, conversationsData, joinConversation]);

  useEffect(() => {
    if (!socket || !me) return;

    const isMessagesPage = pathname?.startsWith("/messages");

    const onNewMessage = (msg: any) => {
      // Refresh list to update UI Unread Badge
      qc.invalidateQueries({ queryKey: QUERY_KEYS.conversations });

      const isMyMessage = (msg.senderUserId || msg.senderId) === me.id;
      // SKIP normal messages we sent (to prevent double-rendering optimistic UI), 
      // but ALLOW System messages / Call events to pass through so the UI updates natively!
      if (isMyMessage && msg.messageType !== "CALL_EVENT" && msg.messageType !== "SYSTEM") return;

      if (!isMessagesPage) {
        if (!isMyMessage) {
          toast.message("Tin nhắn mới", {
            description: msg.messageType === "CALL_EVENT" ? "Cuộc gọi thoại/video" : (msg.content || "Vừa gửi một file đính kèm"),
          });

          // Tự động bật bóng chat
          if (!openConversationIds.includes(msg.conversationId)) {
            openConversation(msg.conversationId);
          }
        }
      } else {
        const isActiveConversation = document.getElementById(`conversation-${msg.conversationId}`)?.getAttribute("aria-current") === "true";
        if (!isActiveConversation && !isMyMessage) {
          toast.message("Tin nhắn mới", {
            description: msg.messageType === "CALL_EVENT" ? "Cuộc gọi thoại/video" : (msg.content || "Có tin nhắn mới..."),
          });
        }
      }

      // 2. Chèn thẳng vào cache Messages !!
      qc.setQueryData(QUERY_KEYS.messages(msg.conversationId), (old: any) => {
        if (!old || !old.pages || !old.pages[0]) {
          // Khởi tạo cache ngay lập tức bằng tin nhắn mới nhận để bật Popup không bị trắng
          return {
            pageParams: [undefined],
            pages: [
              {
                data: [msg],
                meta: { nextCursor: null, count: 1 }
              }
            ]
          };
        }

        const firstPage = old.pages[0];

        // KIỂM TRA TRÙNG LẶP RẤT QUAN TRỌNG:
        const currentMsgs = firstPage.messages || firstPage.data || [];
        // Nếu tin nhắn đã tồn tại (hoặc có tin nhắn optimistic cùng nội dung), thay thế nó!
        const existingIdx = currentMsgs.findIndex((m: any) =>
          m.id === msg.id || (m.isOptimistic && m.content === msg.content)
        );

        let newMsgList;
        if (existingIdx >= 0) {
          newMsgList = [...currentMsgs];
          newMsgList[existingIdx] = msg; // Replace optimistic with real msg
        } else {
          newMsgList = [msg, ...currentMsgs];
        }

        return {
          ...old,
          pages: [
            {
              ...firstPage,
              // React query có thể dùng 'data' hoặc 'messages' tùy lúc
              messages: firstPage.messages ? newMsgList : undefined,
              data: firstPage.data ? newMsgList : undefined
            },
            ...old.pages.slice(1)
          ],
        };
      });
    };

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, onNewMessage);

    // CALL EVENTS
    const onCallIncoming = (data: any) => {
      useCallStore.getState().setIncomingCall({
        callSessionId: data.callSessionId,
        roomName: data.roomName,
        callType: data.callType,
        callerUserId: data.callerUserId,
        callerUsername: data.callerUsername,
        calerDisplayName: data.callerDisplayName,
        callerAvatarUrl: data.callerAvatarUrl,
        otherUserId: data.callerUserId,
      });
    };

    const onCallEndedOrCanceled = (data: { callSessionId?: string }) => {
      useCallStore.getState().clearCallState();

      // If user is currently on the /call/[id] page for this session, redirect them out.
      // Use window.location.pathname (always fresh) rather than the stale pathname closure.
      const callId = data?.callSessionId;
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      if (callId && currentPath.startsWith(`/call/${callId}`)) {
        router.push("/messages");
      } else if (currentPath.startsWith("/call/")) {
        // Fallback: no callSessionId in payload but user is on some /call page
        router.push("/messages");
      }
    };

    socket.on(SOCKET_EVENTS.CALL_INCOMING, onCallIncoming);
    socket.on(SOCKET_EVENTS.CALL_CANCELED, onCallEndedOrCanceled);
    socket.on(SOCKET_EVENTS.CALL_REJECTED, onCallEndedOrCanceled);
    socket.on(SOCKET_EVENTS.CALL_ENDED, onCallEndedOrCanceled);

    // ── POST REAL-TIME EVENTS ──────────────────────────────────────────────────
    // Reaction count changed: update feed cache in-place via setQueriesData
    const onPostReaction = (data: { postId: string; reactionCount: number }) => {
      const patchFeedPages = (old: any): any => {
        if (!old?.pages) return old;
        return {
          ...old,
          // Feed pages shape: { posts: Post[], nextCursor: string|null }
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: (page.posts ?? []).map((p: any) =>
              p.id === data.postId
                ? { ...p, likeCount: data.reactionCount }  // FE uses likeCount
                : p
            ),
          })),
        };
      };
      qc.setQueriesData({ queryKey: QUERY_KEYS.feed }, patchFeedPages);
    };

    // New comment: increment commentCount on matching posts + append to comment list
    const onPostNewComment = (data: { postId: string; comment: any }) => {
      const patchCommentCount = (old: any): any => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            // Feed pages shape: { posts: Post[], nextCursor: string|null }
            posts: (page.posts ?? []).map((p: any) =>
              p.id === data.postId
                ? { ...p, commentCount: (p.commentCount ?? 0) + 1 }
                : p
            ),
          })),
        };
      };
      qc.setQueriesData({ queryKey: QUERY_KEYS.feed }, patchCommentCount);
      // Append new comment into the post comment list cache if already loaded
      // postComments shape: { pages: [{ comments: [], nextCursor }] }
      qc.setQueryData(QUERY_KEYS.postComments(data.postId), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              comments: [...(old.pages[0]?.comments ?? []), data.comment],
            },
            ...old.pages.slice(1),
          ],
        };
      });
    };

    // ── NOTIFICATION BELL ─────────────────────────────────────────────────────
    // Handle server-pushed notifications to update Bell badge without polling
    const pushNotification = useNotificationStore.getState().push;
    const onNewNotification = (notification: any) => {
      pushNotification(notification);
      // Also refresh notifications list panel
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    };

    socket.on(SOCKET_EVENTS.POST_REACTION_UPDATED, onPostReaction);
    socket.on(SOCKET_EVENTS.POST_NEW_COMMENT, onPostNewComment);
    socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, onNewNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, onNewMessage);
      socket.off(SOCKET_EVENTS.CALL_INCOMING, onCallIncoming);
      socket.off(SOCKET_EVENTS.CALL_CANCELED, onCallEndedOrCanceled);
      socket.off(SOCKET_EVENTS.CALL_REJECTED, onCallEndedOrCanceled);
      socket.off(SOCKET_EVENTS.CALL_ENDED, onCallEndedOrCanceled);
      socket.off(SOCKET_EVENTS.POST_REACTION_UPDATED, onPostReaction);
      socket.off(SOCKET_EVENTS.POST_NEW_COMMENT, onPostNewComment);
      socket.off(SOCKET_EVENTS.NEW_NOTIFICATION, onNewNotification);
    };
  }, [socket, pathname, qc, openConversation, openConversationIds, me]);


  return (
    <>
      {children}
      <IncomingCallModal />
      {/* Global PIP call overlay — persists across all routes */}
      <GlobalCallOverlay />
    </>
  );
}
