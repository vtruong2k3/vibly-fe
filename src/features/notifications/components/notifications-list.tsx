import { NotificationItem } from "./notification-item";
import type { AppNotification } from "@/types";

interface NotificationsListProps {
  notifications: AppNotification[];
}

import { EmptyState } from "@/components/shared/empty-state";
import { BellRing } from "lucide-react";

export function NotificationsList({ notifications }: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="vibly-card overflow-hidden">
        <EmptyState 
          icon={<BellRing className="h-8 w-8" />}
          headline="Bạn chưa có thông báo nào"
          description="Khi có người tương tác với bạn, thông báo sẽ hiển thị ở đây."
        />
      </div>
    );
  }

  return (
    <div className="vibly-card overflow-hidden">
      <div className="divide-y divide-border">
        {notifications.map((notif) => (
          <NotificationItem key={notif.id} notification={notif} />
        ))}
      </div>
    </div>
  );
}
