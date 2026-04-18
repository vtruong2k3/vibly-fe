import AdminAuditLogContent from "@/features/admin/components/admin-audit-log-content";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Audit Log — Vibly Admin" };

export default function AdminAuditLogPage() {
  return <AdminAuditLogContent />;
}
