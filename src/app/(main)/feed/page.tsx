import type { Metadata } from "next";
import { MOCK_POSTS } from "@/lib/mock-data/feed";
import { CreatePostCard } from "@/features/feed/components/create-post-card";
import { PostCard } from "@/features/feed/components/post-card";
import { FeedRightSidebar } from "@/features/feed/components/feed-right-sidebar";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Home Feed",
  description: "Your personalized Vibly feed — posts from people you follow.",
};

// ─── Feed Page — Server Component ────────────────────────────────
// In production: data will be fetched via React Query on the client
// For now: mock data passed directly as props to keep SSR boundary clear
export default function FeedPage() {
  return (
    <div className="mx-auto flex justify-center lg:justify-between max-w-[1100px] gap-8 px-0 sm:px-4 py-4 md:py-8 lg:px-8">
      {/* ── Main Feed Column ── */}
      <div className="flex-1 w-full max-w-[620px] space-y-4 md:space-y-6">
        <CreatePostCard />

        <section aria-label="Your feed" className="space-y-4 md:space-y-6">
          {MOCK_POSTS.length > 0 ? (
            MOCK_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <EmptyState 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rss"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>}
              headline="Bảng tin của bạn đang trống"
              description="Hãy đăng bài đầu tiên hoặc kết bạn để làm đầy bảng tin."
            />
          )}
        </section>
      </div>

      {/* ── Right Sidebar Column ── */}
      <div className="hidden w-[320px] shrink-0 lg:block">
        <FeedRightSidebar />
      </div>
    </div>
  );
}
