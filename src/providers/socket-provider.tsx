"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { tokenStorage } from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IncomingMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  content: string;
  sentAt: string;
  sender: {
    id: string;
    username: string;
    profile?: { displayName: string; avatarMediaId: string | null };
  };
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: Set<string>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  onlineUserIds: new Set(),
  joinConversation: () => {},
  leaveConversation: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8000";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Don't connect if not logged in
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = tokenStorage.get();
    if (!token) return;

    // Create socket with auth token
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // Presence — online/offline status from friends
    socket.on("user_presence_changed", ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      onlineUserIds,
      joinConversation: (id) => socketRef.current?.emit("join_conversation", id),
      leaveConversation: (id) => socketRef.current?.emit("leave_conversation", id),
    }}>
      {children}
    </SocketContext.Provider>
  );
}
