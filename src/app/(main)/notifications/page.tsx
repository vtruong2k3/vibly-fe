"use client";

import type { Metadata } from "next";
import { CheckCheck, Loader2, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { useNotificationsQuery, useMarkAllRead } from "@/hooks/use-notifications";
import { EmptyState } from "@/components/shared/empty-state";

// ─── Notifications Page — Client Component ────────────────────────────────────
export default function NotificationsPage() {
  const { data, isLoading, isError } = useNotificationsQuery();
  const { mutate: markAllRead, isPending } = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

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
          <Button
            variant="ghost"
            className="text-primary font-medium gap-2 hidden sm:flex"
            onClick={() => markAllRead()}
            disabled={isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={<BellRing className="h-8 w-8" />}
          headline="Failed to load notifications"
          description="Please refresh the page."
        />
      )}

      {!isLoading && !isError && (
        <NotificationsList notifications={notifications} />
      )}
    </div>
  );
}
