"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/providers/socket-provider";
import { useCallStore } from "@/store/call.store";

// ─── CallSocketListener ───────────────────────────────────────────────────────
// Minimal headless component that lives inside (call)/layout.tsx.
// Listens for call:ended / call:canceled / call:rejected socket events and
// auto-redirects the user back to /messages.
//
// This is needed because (call)/layout.tsx is isolated from (main)/layout.tsx,
// so GlobalChatProvider's socket listeners are not active on the /call page.
// SocketProvider is mounted at root layout, so useSocket() works here. ✅
export function CallSocketListener() {
  const router = useRouter();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleCallEnded = (data: { callSessionId?: string }) => {
      useCallStore.getState().clearCallState();
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      if (currentPath.startsWith("/call/")) {
        router.push("/messages");
      }
    };

    socket.on("call:ended", handleCallEnded);
    socket.on("call:canceled", handleCallEnded);
    socket.on("call:rejected", handleCallEnded);

    return () => {
      socket.off("call:ended", handleCallEnded);
      socket.off("call:canceled", handleCallEnded);
      socket.off("call:rejected", handleCallEnded);
    };
  }, [socket, router]);

  // Headless — renders nothing
  return null;
}
