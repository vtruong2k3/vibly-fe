"use client";

import { useSocketNotifications } from "@/hooks/use-socket-notifications";

// Mount inside SocketProvider to wire real-time notifications
export function NotificationListener() {
  useSocketNotifications();
  return null;
}
