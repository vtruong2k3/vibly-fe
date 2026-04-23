import { AdminAuthGuard } from "@/features/admin/components/admin-auth-guard";
import AdminSidebar from "@/features/admin/components/admin-sidebar";
import AdminHeader from "@/features/admin/components/admin-header";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen w-full bg-white text-gray-900 font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <AdminHeader />
          <div className="flex-1 overflow-y-auto w-full relative">
            {children}
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
