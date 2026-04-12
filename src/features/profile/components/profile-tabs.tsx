"use client";

import { useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/features/feed/components/post-card";
import { CreatePostCard } from "@/features/feed/components/create-post-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ProfileIntroCard } from "./profile-intro-card";
import { ProfileStats } from "./profile-stats";
import { ProfilePhotosCard } from "./profile-photos-card";
import type { Post } from "@/types";
import type { UserProfile } from "@/lib/mock-data/profile";

interface ProfileTabsProps {
  profile: UserProfile;
  posts: Post[];
  isCurrentUser: boolean;
}

export function ProfileTabs({ profile, posts, isCurrentUser }: ProfileTabsProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Tabs defaultValue="posts" className="w-full">
      <div className="mt-8 mb-6 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <TabsList className="flex w-full justify-center lg:justify-start lg:ml-10 gap-10 lg:gap-10 bg-transparent p-0 h-auto overflow-x-auto no-scrollbar rounded-none border-none">
          <TabsTrigger
            value="posts"
            className="group relative rounded-none px-0 py-2 text-[15px] font-semibold text-[#5c6978] !shadow-none !bg-transparent !border-none !ring-0 !flex-none data-[state=active]:text-[#1877F2] outline-none transition-colors"
            onClick={() => startTransition(() => { })}
          >
            Posts<span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#1877F2] rounded-full hidden group-data-[state=active]:block" />
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="group relative rounded-none px-0 py-2 text-[15px] font-semibold text-[#5c6978] !shadow-none !bg-transparent !border-none !ring-0 !flex-none data-[state=active]:text-[#1877F2] outline-none transition-colors"
          >
            About<span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#1877F2] rounded-full hidden group-data-[state=active]:block" />
          </TabsTrigger>
          <TabsTrigger
            value="friends"
            className="group relative rounded-none px-0 py-2 text-[15px] font-semibold text-[#5c6978] !shadow-none !bg-transparent !border-none !ring-0 !flex-none data-[state=active]:text-[#1877F2] outline-none transition-colors"
          >
            Friends<span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#1877F2] rounded-full hidden group-data-[state=active]:block" />
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="group relative rounded-none px-0 py-2 text-[15px] font-semibold text-[#5c6978] !shadow-none !bg-transparent !border-none !ring-0 !flex-none data-[state=active]:text-[#1877F2] outline-none transition-colors"
          >
            Media<span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#1877F2] rounded-full hidden group-data-[state=active]:block" />
          </TabsTrigger>
        </TabsList>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* ── Content: Posts (2-Cột) ── */}
        <TabsContent value="posts" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left Column: Sidebar Widgets */}
            <aside className="hidden lg:block w-[320px] shrink-0 space-y-4">
              <ProfileStats profile={profile} />
              <ProfileIntroCard profile={profile} />
              <ProfilePhotosCard />
            </aside>

            {/* Right Column: Feed / Tab Content */}
            <main className="flex-1 min-w-0">
              <div className="max-w-[620px] mx-auto lg:mx-0 space-y-4">
                {isCurrentUser && <CreatePostCard />}

                {posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <EmptyState
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>}
                    headline="Chưa có bài viết nào"
                    description="Hãy đăng bài đầu tiên hoặc kết bạn để làm đầy bảng tin."
                    className="bg-card rounded-[32px] border border-border shadow-sm"
                  />
                )}
              </div>
            </main>
          </div>
        </TabsContent>

        {/* ── Content: About ── */}
        <TabsContent
          value="about"
          className="w-full m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <div className="w-full flex flex-col lg:flex-row items-start gap-6">
            {/* Left Column */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-4">
              <ProfileStats profile={profile} />
              <ProfileIntroCard profile={profile} />
              <ProfilePhotosCard />
            </div>

            {/* Right Column */}
            <div className="flex-1 min-w-0">
              <div className="max-w-[620px] min-w-[620px] bg-card rounded-[32px] border border-border p-8 text-muted-foreground shadow-sm">
                <p>Chưa có thêm thông tin chi tiết.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Content: Friends ── */}
        <TabsContent value="friends" className="w-full m-0focus-visible:outline-none focus-visible:ring-0">
          <div className="w-full flex flex-col lg:flex-row items-start gap-6">
            {/* Left Column */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-4">
              <ProfileStats profile={profile} />
              <ProfileIntroCard profile={profile} />
              <ProfilePhotosCard />
            </div>

            {/* Right Column */}
            <div className="flex-1 min-w-0">
              <div className="max-w-[620px] min-w-[620px] bg-card rounded-[32px] border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Friends</h2>
                    <p className="text-muted-foreground text-sm">120 friends</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2 border border-border/50 rounded-2xl p-4 transition-colors hover:bg-muted/50 cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Friend avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-sm leading-tight">User {i}</p>
                        <p className="text-xs text-muted-foreground">Mutual friends</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Content: Media ── */}
        <TabsContent value="media" className="w-full m-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="w-full flex flex-col lg:flex-row items-start gap-6">
            {/* Left Column */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-4">
              <ProfileStats profile={profile} />
              <ProfileIntroCard profile={profile} />
              <ProfilePhotosCard />
            </div>

            {/* Right Column */}
            <div className="flex-1 min-w-0">
              <div className="max-w-[620px] min-w-[620px] max-[620px]:min-w-0 max-[620px]:w-full bg-card rounded-[32px] border border-border shadow-sm">
                <EmptyState
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>}
                  headline="Chưa có hình ảnh"
                  description="Chưa có phương tiện nào được chia sẻ."
                  className="bg-transparent border-none shadow-none"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
