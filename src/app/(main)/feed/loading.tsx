import { CardSkeleton } from "@/components/shared/skeletons";
import { CreatePostCard } from "@/features/feed/components/create-post-card";
import { FeedRightSidebar } from "@/features/feed/components/feed-right-sidebar";

export default function FeedLoading() {
  return (
    <div className="mx-auto flex justify-center lg:justify-between max-w-[1100px] gap-8 px-0 sm:px-4 py-4 md:py-8 lg:px-8">
      {/* ── Main Feed Column ── */}
      <div className="flex-1 w-full max-w-[620px] space-y-4 md:space-y-6">
        <CreatePostCard />

        <section aria-label="Loading feed" className="space-y-4 md:space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </section>
      </div>

      {/* ── Right Sidebar Column ── */}
      <div className="hidden w-[320px] shrink-0 lg:block opacity-50">
        <FeedRightSidebar />
      </div>
    </div>
  );
}
