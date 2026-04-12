import type { Metadata } from "next";
import { FriendRequestCard } from "@/features/friendships/components/friend-request-card";
import { FriendSuggestionCard } from "@/features/friendships/components/friend-suggestion-card";
import { FriendsListSection } from "@/features/friendships/components/friends-list-section";
import {
  MOCK_FRIEND_REQUESTS,
  MOCK_SUGGESTIONS,
  MOCK_FRIENDS,
} from "@/lib/mock-data/friends";

export const metadata: Metadata = {
  title: "Friends | Vibly",
  description: "Manage your friends and connections on Vibly.",
};

export default function FriendsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Column: Friend Requests & Current Friends */}
        <div className="flex-1 space-y-8">
          
          {/* Friend Requests Section */}
          {MOCK_FRIEND_REQUESTS.length > 0 && (
            <section>
              <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                Friend Requests
                <span className="ml-2 text-sm font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                  {MOCK_FRIEND_REQUESTS.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_FRIEND_REQUESTS.map((req) => (
                  <FriendRequestCard key={req.id} request={req} />
                ))}
              </div>
            </section>
          )}

          {/* Current Friends Section */}
          <section>
            <h2 className="text-xl font-heading font-bold text-foreground mb-4">
              All Friends
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                {MOCK_FRIENDS.length}
              </span>
            </h2>
            <FriendsListSection friends={MOCK_FRIENDS} />
          </section>
        </div>

        {/* Sidebar Column: Suggestions */}
        <div className="lg:w-80 space-y-8">
          <section>
            <h2 className="text-lg font-heading font-bold text-foreground mb-4">
              People You May Know
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {MOCK_SUGGESTIONS.map((user) => (
                <FriendSuggestionCard key={user.id} user={user} />
              ))}
            </div>
          </section>
        </div>
        
      </div>
    </div>
  );
}
