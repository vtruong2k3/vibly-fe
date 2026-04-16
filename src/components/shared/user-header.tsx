"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import Link from "next/link";
import { usePresenceStore } from "@/store/presence.store";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export interface BaseUser {
  id?: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
}

interface UserHeaderProps {
  user: BaseUser;
  subtitle?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  avatarClassName?: string;
  withLink?: boolean;
  showOnlineBadge?: boolean;
}

// ─── PresenceLabel ─────────────────────────────────────────────────
function PresenceLabel({
  isOnline,
  lastSeenAt,
}: {
  isOnline: boolean;
  lastSeenAt: string | null;
}) {
  if (isOnline) {
    return (
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-500">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Active now
      </span>
    );
  }

  if (lastSeenAt) {
    const ago = formatDistanceToNow(new Date(lastSeenAt), {
      addSuffix: false,
      locale: vi,
    });
    return (
      <span className="text-[13px] text-muted-foreground font-medium truncate pt-0.5">
        Hoạt động {ago} trước
      </span>
    );
  }

  return (
    <span className="text-[13px] text-muted-foreground font-medium truncate pt-0.5">
      Offline
    </span>
  );
}

export function UserHeader({
  user,
  subtitle,
  size = "md",
  className,
  avatarClassName,
  withLink = true,
  showOnlineBadge = false,
}: UserHeaderProps) {
  const isSm = size === "sm";

  // Subscribe to global store for real-time presence
  const storePresence = usePresenceStore((s) => (user.id ? s.users[user.id] : undefined));
  const isOnline = storePresence?.isOnline ?? user.isOnline ?? false;
  const lastSeenAt = storePresence?.lastSeenAt ?? user.lastSeenAt ?? null;

  const Content = (
    <div className={cn("flex flex-col min-w-0 justify-center", className)}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-bold text-foreground truncate",
            isSm ? "text-[14px]" : "text-[15px]",
            withLink && "hover:underline cursor-pointer"
          )}
        >
          {user.displayName}
        </span>
        {showOnlineBadge && isOnline && (
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[10px] font-medium bg-[--color-success]/15 text-[--color-success] border-[--color-success]/20"
          >
            Active
          </Badge>
        )}
      </div>
      {subtitle ? (
        <span className="text-[13px] text-muted-foreground font-medium truncate pt-0.5">
          {subtitle}
        </span>
      ) : (
        <PresenceLabel
          isOnline={isOnline}
          lastSeenAt={lastSeenAt}
        />
      )}
    </div>
  );

  return (
    <div className="flex items-center gap-3.5 min-w-0">
      {withLink ? (
        <Link href={`/profile/${user.username}`}>
          <UserAvatar user={user} size={size} className={cn("shrink-0", avatarClassName)} />
        </Link>
      ) : (
        <UserAvatar user={user} size={size} className={cn("shrink-0", avatarClassName)} />
      )}

      {withLink ? (
        <Link href={`/profile/${user.username}`} className="min-w-0">
          {Content}
        </Link>
      ) : (
        Content
      )}
    </div>
  );
}
