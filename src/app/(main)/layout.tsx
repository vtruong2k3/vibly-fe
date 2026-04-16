"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/shared/auth-guard";
import { ChatBubbleDock } from "@/features/chat/components/chat-bubble-dock";
import { AppHeader } from "@/components/layout/app-header";
import { NotificationListener } from "@/components/shared/notification-listener";
import { GlobalChatProvider } from "@/providers/global-chat-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <GlobalChatProvider>
        <div className="flex flex-col-reverse md:flex-row h-screen overflow-hidden bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <AppHeader />
            <main className="flex-1 flex flex-col min-h-0 overflow-y-auto w-full relative">
              {children}
            </main>
          </div>
        </div>
        {/* Floating chat bubbles — persists across all pages */}
        <ChatBubbleDock />
        {/* Real-time notification listener */}
        <NotificationListener />
      </GlobalChatProvider>
    </AuthGuard>
  );
}
