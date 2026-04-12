import Link from "next/link";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

interface FriendsListSectionProps {
  friends: User[];
}

export function FriendsListSection({ friends }: FriendsListSectionProps) {
  if (friends.length === 0) {
    return (
      <div className="vibly-card p-12 text-center text-muted-foreground w-full">
        You don&apos;t have any friends yet.
      </div>
    );
  }

  return (
    <div className="vibly-card overflow-hidden">
      <div className="divide-y divide-border">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Link href={`/profile/${friend.username}`} className="relative shrink-0">
                <Avatar className="h-12 w-12 hover:opacity-80 transition-opacity">
                  <AvatarImage src={friend.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {friend.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                {friend.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success ring-2 ring-card" />
                )}
              </Link>
              
              <div>
                <Link
                  href={`/profile/${friend.username}`}
                  className="text-sm font-semibold text-foreground hover:underline"
                >
                  {friend.displayName}
                </Link>
                <p className="text-xs text-muted-foreground">
                  @{friend.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
