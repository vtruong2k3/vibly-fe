import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, UserPlus, AtSign, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AppNotification } from "@/types";

interface NotificationItemProps {
  notification: AppNotification;
}

const getNotificationIcon = (type: AppNotification["type"]) => {
  switch (type) {
    case "like_post":
      return <Heart className="h-4 w-4 text-destructive fill-destructive" />;
    case "comment_post":
      return <MessageSquare className="h-4 w-4 text-primary fill-primary/20" />;
    case "friend_request":
      return <UserPlus className="h-4 w-4 text-accent" />;
    case "friend_accept":
      return <UserCheck className="h-4 w-4 text-success" />;
    case "mention":
      return <AtSign className="h-4 w-4 text-orange-500" />;
  }
};

const getNotificationText = (notification: AppNotification) => {
  const actorName = (
    <span className="font-semibold text-foreground">
      {notification.actor.displayName}
    </span>
  );

  switch (notification.type) {
    case "like_post":
      return <>{actorName} liked your post.</>;
    case "comment_post":
      return <>{actorName} commented on your post.</>;
    case "friend_request":
      return <>{actorName} sent you a friend request.</>;
    case "friend_accept":
      return <>{actorName} accepted your friend request.</>;
    case "mention":
      return <>{actorName} mentioned you in a comment.</>;
  }
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <Link
      href={`#${notification.entityId}`} // Mock anchor link for now
      className={cn(
        "flex gap-4 p-4 transition-colors hover:bg-muted/50 items-start",
        !notification.isRead ? "bg-primary/5" : "bg-transparent"
      )}
    >
      <div className="relative shrink-0 mt-1">
        <UserAvatar user={notification.actor} size="md" className="h-12 w-12" />
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-card ring-2 ring-card flex items-center justify-center shadow-sm">
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground leading-snug">
          {getNotificationText(notification)}
        </p>
        <p className={cn(
          "text-xs mt-1 font-medium",
          !notification.isRead ? "text-primary" : "text-muted-foreground"
        )}>
          {timeAgo}
        </p>
      </div>

      {!notification.isRead && (
        <div className="shrink-0 mt-3 h-2.5 w-2.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}
