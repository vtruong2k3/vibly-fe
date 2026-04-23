import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostDetailView } from "@/features/feed/components/post-detail-view";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

// ─── Server-side post fetch for metadata ────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function fetchPostForMeta(id: string) {
  try {
    const res = await fetch(`${API}/posts/${id}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

// ─── generateMetadata — real post data for SEO & share preview ──────────────
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPostForMeta(id);

  if (!post) {
    return { title: "Post — Vibly" };
  }

  const authorName =
    post.author?.profile?.displayName ?? post.author?.username ?? "Vibly User";
  const content = post.content
    ? post.content.slice(0, 155)
    : `A post by ${authorName} on Vibly.`;
  const title = `${authorName} on Vibly`;

  // First attached image used as og:image
  const ogImage =
    post.media?.[0]?.url ?? post.media?.[0]?.objectKey
      ? `${process.env.NEXT_PUBLIC_CDN_URL}/${post.media[0].objectKey}`
      : undefined;

  return {
    title,
    description: content,
    openGraph: {
      title,
      description: content,
      type: "article",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description: content,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

// ─── Post Detail Page — Server Component ─────────────────────────────────────
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
