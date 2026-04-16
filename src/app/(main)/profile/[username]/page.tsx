"use client";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfileTabs } from "@/features/profile/components/profile-tabs";
import { useUserProfile, useMe } from "@/hooks/use-users";

// ─── Profile Page — Client Component ─────────────────────────────────────────
export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const { data: me } = useMe();
  const { data: profile, isLoading, isError } = useUserProfile(username);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !profile) {
    notFound();
  }

  const isCurrentUser = me?.username === username;

  return (
    <div className="flex-1 pb-16 bg-background">
      <ProfileHeader profile={profile as any} isCurrentUser={isCurrentUser} />
      <ProfileTabs profile={profile as any} posts={(profile as any).posts ?? []} isCurrentUser={isCurrentUser} />
    </div>
  );
}
