import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface UserAvatarProps {
  user: User | Pick<User, "displayName" | "avatarUrl">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-[46px] w-[46px]",
  xl: "h-24 w-24 ring-4 ring-primary/20 shadow-xl", // used in modals
};

export function UserAvatar({ user, size = "md", className, isOnline }: UserAvatarProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {user.displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      {isOnline && (
        <span className="absolute bottom-0 right-0 online-dot" />
      )}
    </div>
  );
}
