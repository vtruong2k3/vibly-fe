import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfileTabs } from "@/features/profile/components/profile-tabs";

// ─── Server-side fetch helpers ──────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function fetchUserByUsername(username: string) {
  try {
    const res = await fetch(`${API}/users/${username}`, {
      next: { revalidate: 60 }, // ISR: stale after 60s
    });
    if (!res.ok) return null;
    const json = await res.json();
    const u = json.data ?? json;

    const buildUrl = (media?: { bucket: string; objectKey: string }) => {
      if (!media) return null;
      const baseUrl =
        process.env.NEXT_PUBLIC_CDN_URL ??
        `https://${media.bucket}.s3.ap-southeast-1.amazonaws.com`;
      return `${baseUrl}/${media.objectKey}`;
    };

    return {
      id: u.id as string,
      username: u.username as string,
      displayName: (u.profile?.displayName || u.username) as string,
      avatarUrl:
        buildUrl(u.profile?.avatarMedia) || u.profile?.avatarMediaId || null,
      coverUrl:
        buildUrl(u.profile?.coverMedia) || u.profile?.coverMediaId || null,
      bio: (u.profile?.bio || "") as string,
      followersCount: 0,
      followingCount: 0,
      location: (u.profile?.currentCity || null) as string | null,
      education: (u.profile?.education || null) as string | null,
      maritalStatus: (u.profile?.maritalStatus || null) as string | null,
      hometown: (u.profile?.hometown || null) as string | null,
      website: (u.profile?.website || null) as string | null,
      birthday: (u.profile?.birthday || null) as string | null,
      gender: (u.profile?.gender || null) as string | null,
      createdAt: u.createdAt as string,
    };
  } catch {
    return null;
  }
}

// ─── generateMetadata — for SEO & share preview ────────────────────────────
interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchUserByUsername(username);

  if (!profile) {
    return { title: "Profile not found — Vibly" };
  }

  const title = `${profile.displayName} (@${profile.username}) — Vibly`;
  const description = profile.bio
    ? profile.bio.slice(0, 155)
    : `View ${profile.displayName}'s profile on Vibly.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : [],
      type: "profile",
      username: profile.username,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}

// ─── Profile Page — Server Component ─────────────────────────────────────────
// Fetches profile data server-side for SEO + fast TTFB.
// ProfileHeader and ProfileTabs remain as Client Components for interactivity.
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await fetchUserByUsername(username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="flex-1 pb-16 bg-background">
      {/* profile is prefetched on server and passed as initial data */}
      <ProfileHeader profile={profile as any} isCurrentUser={false} />
      <ProfileTabs profile={profile as any} posts={[]} isCurrentUser={false} />
    </div>
  );
}
