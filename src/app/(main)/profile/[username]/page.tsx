import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfileTabs } from "@/features/profile/components/profile-tabs";
import {
  MOCK_PROFILE,
  MOCK_RIVERS_PROFILE,
  getMockPostsForUser,
} from "@/lib/mock-data/profile";
import { MOCK_CURRENT_USER } from "@/lib/mock-data/feed";

// ─── Params ───────────────────────────────────────────────────────
type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

// ─── Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} | Vibly`,
    description: `View the profile of @${username} on Vibly.`,
  };
}

// ─── Component ────────────────────────────────────────────────────
// Server Component representing the profile layout
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Mock routing logic: determine which profile to show
  let profile;
  if (username === MOCK_CURRENT_USER.username) {
    profile = MOCK_PROFILE;
  } else if (username === MOCK_RIVERS_PROFILE.username) {
    profile = MOCK_RIVERS_PROFILE;
  } else {
    // If unknown user, just return 404
    notFound();
  }

  const isCurrentUser = username === MOCK_CURRENT_USER.username;
  const userPosts = getMockPostsForUser(profile.id);

  return (
    <div className="flex-1 pb-16 bg-background">
      {/* Upper header section */}
      <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />

      {/* Main content wrapper containing Tabs + 2 Column Sidebar/Feed Grid */}
      <ProfileTabs profile={profile} posts={userPosts} isCurrentUser={isCurrentUser} />
    </div>
  );
}
