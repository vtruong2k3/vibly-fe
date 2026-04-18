
import AdminDashboardContent from "@/features/admin/components/admin-dashboard-content";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Dashboard — Vibly Admin" };

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
