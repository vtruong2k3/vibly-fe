"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSocket } from "@/providers/socket-provider";
import { useChatStore } from "@/store/chat.store";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/api/constants";
import { useAuthStore } from "@/store/auth.store";
import { useConversationsQuery } from "@/hooks/use-conversations";
import { useCallStore } from "@/store/call.store";
import { IncomingCallModal } from "@/features/chat/components/incoming-call-modal";
import { CallWindowWidget } from "@/features/chat/components/call-window-widget";
import { useNotificationStore } from "@/store/notifications.store";

export function GlobalChatProvider({ children }: { children: React.ReactNode }) {
  const { socket, joinConversation } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const { openConversation, openConversationIds } = useChatStore();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);

  // Lấy sẵn danh sách hộp thoại của user
  const { data: conversationsData } = useConversationsQuery();

  // Tự động JOIN vào tất cả các phòng Chat để bắt sự kiện Background
  useEffect(() => {
    if (!socket || !conversationsData) return;
    const conversationsArray = Array.isArray(conversationsData)
      ? conversationsData
      : (conversationsData as any)?.data ?? (conversationsData as any)?.conversations ?? [];
      
    conversationsArray.forEach((conv: any) => {
      joinConversation(conv.id);
    });
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
    
    socket.on("new_message", onNewMessage);

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

    socket.on("call:incoming", onCallIncoming);
    socket.on("call:canceled", onCallEndedOrCanceled);
    socket.on("call:rejected", onCallEndedOrCanceled);
    socket.on("call:ended", onCallEndedOrCanceled);

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

    socket.on("post:reaction_updated", onPostReaction);
    socket.on("post:new_comment", onPostNewComment);
    socket.on("new_notification", onNewNotification);

    return () => { 
      socket.off("new_message", onNewMessage); 
      socket.off("call:incoming", onCallIncoming);
      socket.off("call:canceled", onCallEndedOrCanceled);
      socket.off("call:rejected", onCallEndedOrCanceled);
      socket.off("call:ended", onCallEndedOrCanceled);
      socket.off("post:reaction_updated", onPostReaction);
      socket.off("post:new_comment", onPostNewComment);
      socket.off("new_notification", onNewNotification);
    };
  }, [socket, pathname, qc, openConversation, openConversationIds, me]);


  return (
    <>
      {children}
      <IncomingCallModal />
      <CallWindowWidget />
    </>
  );
}
