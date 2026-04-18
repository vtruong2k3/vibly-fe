import AdminAuthGuard from "@/features/admin/components/admin-auth-guard";
import AdminHeader from "@/features/admin/components/admin-header";
import AdminSidebar from "@/features/admin/components/admin-sidebar";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Vibly Admin",
  description: "Internal administration panel",
  robots: { index: false, follow: false },
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="flex h-screen bg-[#0B1120] overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
