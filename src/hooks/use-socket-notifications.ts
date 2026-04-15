"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/providers/socket-provider";
import { useNotificationStore, type AppNotification } from "@/store/notifications.store";
import { useAuthStore } from "@/store/auth.store";

// ─── useSocketNotifications ───────────────────────────────────────────────────
// Mount this ONCE in MainLayout (already inside SocketProvider).
// Listens for 'notification' events and:
//   1. Pushes into the Zustand notification store (drives Bell badge)
//   2. Shows a toast
//   3. Invalidates relevant React Query caches

export function useSocketNotifications() {
  const { socket } = useSocket();
  const push = useNotificationStore((s) => s.push);
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (payload: Omit<AppNotification, "id" | "read" | "createdAt">) => {
      push(payload);

      switch (payload.type) {
        case "friend_request_received": {
          const name = payload.sender?.displayName || payload.sender?.username || "Ai đó";
          toast(`${name} đã gửi lời mời kết bạn 👋`, {
            description: "Xem trang cá nhân để phản hồi",
            action: {
              label: "Xem",
              onClick: () => {
                if (payload.sender?.username) {
                  window.location.href = `/profile/${payload.sender.username}`;
                }
              },
            },
          });
          // Invalidate incoming request list
          qc.invalidateQueries({ queryKey: ["friendship-status"] });
          break;
        }

        case "friend_request_accepted": {
          // Invalidate friendship status for the person who accepted
          if (payload.acceptedBy?.id) {
            qc.invalidateQueries({ queryKey: ["friendship-status", payload.acceptedBy?.id] });
          }
          // Also refresh friend list
          qc.invalidateQueries({ queryKey: ["friends"] });
          toast.success("Lời mời kết bạn đã được chấp nhận! 🎉");
          break;
        }

        default:
          break;
      }
    };

    socket.on("notification", handleNotification);
    return () => { socket.off("notification", handleNotification); };
  }, [socket, push, qc]);
}
