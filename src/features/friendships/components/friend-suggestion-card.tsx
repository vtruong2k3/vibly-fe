import { useState } from "react";
import { UserPlus, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";
import { useSendFriendRequest } from "@/hooks/use-users";

interface FriendSuggestionCardProps {
  user: User;
}

export function FriendSuggestionCard({ user }: FriendSuggestionCardProps) {
  const [sent, setSent] = useState(false);
  const { mutate: sendRequest, isPending } = useSendFriendRequest();

  const handleAdd = () => {
    if (sent) return;
    sendRequest({ addresseeId: user.id }, { onSuccess: () => setSent(true) });
  };
  return (
    <div className="vibly-card p-4 flex flex-col items-center text-center space-y-3">
      <Link href={`/profile/${user.username}`}>
        <Avatar className="h-20 w-20 hover:opacity-80 transition-opacity mx-auto">
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
            {user.displayName[0]}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0 w-full px-2">
        <Link
          href={`/profile/${user.username}`}
          className="text-sm font-semibold text-foreground hover:underline truncate block"
        >
          {user.displayName}
        </Link>
        <p className="text-xs text-muted-foreground truncate w-full mt-0.5">
          {user.bio ?? `@${user.username}`}
        </p>
      </div>

      <Button
        className="w-full rounded-xl gap-2 font-medium"
        variant={sent ? "default" : "outline"}
        onClick={handleAdd}
        disabled={sent || isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : sent ? (
          <><Check className="h-4 w-4" /> Requested</>
        ) : (
          <><UserPlus className="h-4 w-4" /> Add Friend</>
        )}
      </Button>
    </div>
  );
}
