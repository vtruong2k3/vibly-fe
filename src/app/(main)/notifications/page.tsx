import type { Metadata } from "next";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data/notifications";

export const metadata: Metadata = {
  title: "Notifications | Vibly",
  description: "View your recent notifications on Vibly.",
};

export default function NotificationsPage() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
          Notifications
          {unreadCount > 0 && (
            <span className="text-sm font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </h1>
        
        {unreadCount > 0 && (
          <Button variant="ghost" className="text-primary font-medium gap-2 hidden sm:flex">
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <NotificationsList notifications={MOCK_NOTIFICATIONS} />
    </div>
  );
}
