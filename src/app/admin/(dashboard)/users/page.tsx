import AdminUsersContent from "@/features/admin/components/admin-users-content";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Users — Vibly Admin" };

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
