import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import type { User } from "@/types";
import Link from "next/link";

interface UserHeaderProps {
  user: User;
  subtitle?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  avatarClassName?: string;
  withLink?: boolean;
  showOnlineBadge?: boolean; // Like the generic "Active" badge, rather than the dot
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
        {showOnlineBadge && user.isOnline && (
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[10px] font-medium bg-[--color-success]/15 text-[--color-success] border-[--color-success]/20"
          >
            Active
          </Badge>
        )}
      </div>
      {(subtitle || user.username) && (
        <span className="text-[13px] text-muted-foreground font-medium truncate pt-0.5">
          {subtitle || `@${user.username}`}
        </span>
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
