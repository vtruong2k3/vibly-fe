
import AdminCommentsContent from "@/features/admin/components/admin-comments-content";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Comments — Vibly Admin" };
export default function AdminCommentsPage() {
  return <AdminCommentsContent />;
}
