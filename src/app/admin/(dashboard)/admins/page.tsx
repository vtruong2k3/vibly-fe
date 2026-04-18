import AdminRolesContent from "@/features/admin/components/admin-roles-content";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Admins & Roles — Vibly Admin" };

export default function AdminRolesPage() {
  return <AdminRolesContent />;
}
