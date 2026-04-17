"use client";

import { Loader2, Users, UserCheck } from "lucide-react";
import { FriendRequestCard } from "@/features/friendships/components/friend-request-card";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useFriendRequests, useFriends } from "@/hooks/use-friendships";
import { buildMediaUrl } from "@/lib/utils";
import type { FriendRequest } from "@/types";

// ─── Friends Page ─────────────────────────────────────────────────────────────
export default function FriendsPage() {
  const { data: requestsRaw, isLoading: requestsLoading } = useFriendRequests();
  const { data: friendsRaw, isLoading: friendsLoading } = useFriends();

  // Backend returns a flat array for both endpoints
  const requests: FriendRequest[] = Array.isArray(requestsRaw)
    ? requestsRaw.map((r: {
        id: string;
        requesterId: string;
        createdAt: string;
        requester: {
          id: string;
          username: string;
          profile?: { displayName?: string; avatarMediaId?: string | null; avatarMedia?: any };
        };
      }) => ({
        id: r.id,
        receiverId: r.requesterId,
        status: "pending" as const,
        createdAt: r.createdAt,
        sender: {
          id: r.requester.id,
          username: r.requester.username,
          displayName: r.requester.profile?.displayName ?? r.requester.username,
          avatarUrl: buildMediaUrl(r.requester.profile?.avatarMedia) ?? r.requester.profile?.avatarMediaId ?? null,
          bio: null,
          isOnline: false,
          createdAt: r.createdAt,
        },
      }))
    : [];

  const friends = Array.isArray(friendsRaw) ? friendsRaw : [];
  const isLoading = requestsLoading || friendsLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-heading text-foreground mb-8">Bạn bè</h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-10">

          {/* Friend Requests Section */}
          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              Lời mời kết bạn
              {requests.length > 0 && (
                <span className="text-sm font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                  {requests.length}
                </span>
              )}
            </h2>
            {requests.length === 0 ? (
              <EmptyState
                icon={<Users className="h-8 w-8" />}
                headline="Chưa có lời mời nào"
                description="Khi ai đó gửi lời mời kết bạn cho bạn, họ sẽ hiện ở đây."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <FriendRequestCard key={req.id} request={req} />
                ))}
              </div>
            )}
          </section>

          {/* Current Friends Section */}
          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              Bạn bè
              <span className="text-sm font-medium text-muted-foreground">({friends.length})</span>
            </h2>
            {friends.length === 0 ? (
              <EmptyState
                icon={<UserCheck className="h-8 w-8" />}
                headline="Chưa có bạn bè"
                description="Hãy tìm kiếm và kết bạn với những người bạn biết!"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(friends as Array<{
                  user: { id: string; username: string; isOnline?: boolean; profile?: { displayName?: string; avatarMediaId?: string | null; avatarMedia?: any } };
                }>).map((f) => (
                  <a
                    key={f.user.id}
                    href={`/profile/${f.user.username}`}
                    className="vibly-card p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <UserAvatar 
                      user={{
                        id: f.user.id,
                        username: f.user.username,
                        displayName: f.user.profile?.displayName ?? f.user.username,
                        avatarUrl: buildMediaUrl(f.user.profile?.avatarMedia) ?? f.user.profile?.avatarMediaId ?? null,
                      }} 
                      size="xl" 
                      isOnline={f.user.isOnline} 
                    />
                    <p className="text-sm font-semibold text-foreground truncate w-full mt-2">
                      {f.user.profile?.displayName ?? f.user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">@{f.user.username}</p>
                  </a>
                ))}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}
