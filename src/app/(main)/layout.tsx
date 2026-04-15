"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/shared/auth-guard";
import { SocketProvider } from "@/providers/socket-provider";
import { ChatBubbleDock } from "@/features/chat/components/chat-bubble-dock";
import { AppHeader } from "@/components/layout/app-header";
import { NotificationListener } from "@/components/shared/notification-listener";

// Main layout: persistent sidebar + content area + real-time socket + chat bubbles
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SocketProvider>
        <div className="flex flex-col-reverse md:flex-row h-screen overflow-hidden bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <AppHeader />
            <main className="flex-1 overflow-y-auto w-full">
              {children}
            </main>
          </div>
        </div>
        {/* Floating chat bubbles — persists across all pages */}
        <ChatBubbleDock />
        {/* Real-time notification listener */}
        <NotificationListener />
      </SocketProvider>
    </AuthGuard>
  );
}
