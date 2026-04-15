import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostDetailView } from "@/features/feed/components/post-detail-view";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  // TODO: Fetch real post for metadata in production via GET /posts/:id
  return {
    title: `Post — Vibly`,
    description: `View post ${id} on Vibly.`,
  };
}

// ─── Post Detail Page — Server Component ──────────────────────────
// In production: fetch post via GET /posts/:id (server-side)
export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ── Back navigation ── */}
      <div className="mb-6">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Feed
        </Link>
      </div>

      {/* ── Post Detail Feature Component ── */}
      <PostDetailView postId={id} />
    </div>
  );
}
