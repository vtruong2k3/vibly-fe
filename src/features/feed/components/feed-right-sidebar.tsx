"use client";

import { useState } from "react";
import { useFriends } from "@/hooks/use-friendships";
import { usePresenceStore } from "@/store/presence.store";
import { UserHeader } from "@/components/shared/user-header";
import { buildMediaUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// ─── FeedRightSidebar ──────────────────────────────────────────────
export function FeedRightSidebar() {
  const { data: friendsRaw } = useFriends();
  const presences = usePresenceStore((s) => s.users);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate real online friends
  const friends = Array.isArray(friendsRaw) ? friendsRaw : [];
  
  // Sort friends: online first
  const sortedFriends = [...friends].sort((a, b) => {
    const aOnline = presences[a.user.id]?.isOnline ?? a.user.isOnline ?? false;
    const bOnline = presences[b.user.id]?.isOnline ?? b.user.isOnline ?? false;
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return 0;
  });

  const onlineFriends = sortedFriends.filter((f) => {
    const fId = f.user.id;
    return presences[fId]?.isOnline ?? f.user.isOnline ?? false;
  });

  const displayLimit = isExpanded ? sortedFriends.length : 5;

  return (
    <aside className="space-y-6 sticky top-6">
      {/* Friends Widget */}
      <div className="vibly-card p-5 space-y-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg text-foreground">Bạn bè</h3>
          {onlineFriends.length > 0 && (
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
              {onlineFriends.length} ONLINE
            </span>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          {sortedFriends.slice(0, displayLimit).map((f: any) => {
            const rawUser = f.user;
            const formattedUser = {
              ...rawUser,
              displayName: rawUser.profile?.displayName ?? rawUser.username,
              avatarUrl: buildMediaUrl(rawUser.profile?.avatarMedia) ?? rawUser.profile?.avatarMediaId ?? rawUser.avatarUrl,
            };

            return (
              <UserHeader
                key={formattedUser.id}
                user={formattedUser}
                size="md"
                withLink={true}
                showOnlineBadge={false}
                className="flex-1 min-w-0"
              />
            );
          })}
          {sortedFriends.length === 0 && (
            <p className="text-xs text-muted-foreground pt-1">Chưa có bạn bè nào.</p>
          )}
        </div>
        
        {sortedFriends.length > 5 && (
          <Button 
            variant="ghost" 
            className="w-full text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground justify-center px-0 pt-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "SHOW LESS" : "VIEW ALL"}
          </Button>
        )}
      </div>

      {/* Trending Sanctuary Widget */}
      <div className="vibly-card p-5 space-y-5">
        <h3 className="font-heading font-bold text-lg text-foreground">Trending Sanctuary</h3>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">#Minimalism</p>
            <h4 className="font-semibold text-foreground text-sm leading-tight">Finding Peace in the Chaos</h4>
            <p className="text-xs text-muted-foreground pt-0.5">12.5k posts</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">#ViblyLive</p>
            <h4 className="font-semibold text-foreground text-sm leading-tight">Community Wellness Session</h4>
            <p className="text-xs text-muted-foreground pt-0.5">8.2k posts</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">#DigitalDetox</p>
            <h4 className="font-semibold text-foreground text-sm leading-tight">How to unplug effectively</h4>
            <p className="text-xs text-muted-foreground pt-0.5">5.1k posts</p>
          </div>
        </div>
      </div>

      {/* Suggestions Widget */}
      <div className="vibly-card p-5 space-y-4 bg-muted/30">
        <h3 className="font-heading font-bold text-lg text-foreground">Suggestions</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src="https://i.pravatar.cc/150?u=chloe" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">Chloe Sims</span>
                <span className="text-xs text-muted-foreground truncate">Followed by Alex</span>
              </div>
            </div>
            <Button size="sm" variant="secondary" className="h-8 rounded-full px-4 text-xs font-semibold shrink-0">
              Follow
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src="https://i.pravatar.cc/150?u=liam" />
                <AvatarFallback>L</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">Liam Wright</span>
                <span className="text-xs text-muted-foreground truncate">Suggested for you</span>
              </div>
            </div>
            <Button size="sm" variant="secondary" className="h-8 rounded-full px-4 text-xs font-semibold shrink-0">
              Follow
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
