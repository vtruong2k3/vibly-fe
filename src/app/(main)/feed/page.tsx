"use client";

import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { CreatePostCard } from "@/features/feed/components/create-post-card";
import { PostCard } from "@/features/feed/components/post-card";
import { FeedRightSidebar } from "@/features/feed/components/feed-right-sidebar";
import { PostCardSkeleton } from "@/features/feed/components/post-card-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useFeedQuery } from "@/hooks/use-feed";
import { Rss } from "lucide-react";

// ─── Feed Client Component — infinite scroll ──────────────────────────────────
export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useFeedQuery();

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for auto-load on scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage(); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="mx-auto flex justify-center lg:justify-between max-w-[1400px] gap-6 xl:gap-8 px-2 sm:px-4 md:px-8 py-2 sm:py-4 md:py-8">
      {/* ── Main Feed Column ── */}
      <div className="flex-1 w-full max-w-[760px] 2xl:max-w-[1350px] 2xl:min-w-[900px] space-y-4 md:space-y-6">
        <CreatePostCard />

        <section aria-label="Your feed" className="space-y-4 md:space-y-6">
          {isLoading && (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          )}

          {isError && (
            <EmptyState
              icon={<Rss className="h-8 w-8" />}
              headline="Could not load feed"
              description="Something went wrong. Please refresh the page."
            />
          )}

          {!isLoading && !isError && posts.length === 0 && (
            <EmptyState
              icon={<Rss className="h-8 w-8" />}
              headline="Your feed is empty"
              description="Start following people or create your first post."
            />
          )}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </section>
      </div>

      {/* ── Right Sidebar Column ── */}
      <div className="hidden w-[380px] shrink-0 xl:block 2xl:w-[400px]">
        <FeedRightSidebar />
      </div>
    </div>
  );
}
