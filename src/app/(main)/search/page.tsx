import type { Metadata } from "next";
import { SearchUsersPanel } from "@/features/friendships/components/search-users-panel";

export const metadata: Metadata = {
  title: "Find People — Vibly",
  description: "Search for friends and people to connect with on Vibly.",
};

// ─── Search Page — Server Component ───────────────────────────────
// Client boundary is pushed down into SearchUsersPanel
export default function SearchPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-foreground">
          Find People
        </h1>
        <p className="text-muted-foreground mt-1">
          Search for friends by name or username and send them a connection
          request.
        </p>
      </div>

      {/* ── Search Feature Component ── */}
      <SearchUsersPanel />
    </div>
  );
}
