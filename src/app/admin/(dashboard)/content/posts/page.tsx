
import AdminPostsContent from "@/features/admin/components/admin-posts-content";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Posts — Vibly Admin" };

export default function AdminPostsPage() {
  return <AdminPostsContent />;
}
