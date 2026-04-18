"use client";

import { usePathname } from "next/navigation";
import { LogOut, ChevronRight } from "lucide-react";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import adminAuthService from "@/lib/services/admin-auth.service";

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Users",
  "/admin/content/posts": "Posts",
  "/admin/content/comments": "Comments",
  "/admin/reports": "Reports",
  "/admin/analytics": "Analytics",
  "/admin/audit-log": "Audit Log",
  "/admin/admins": "Admins & Roles",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { admin, clearAuth } = useAdminAuthStore();

  const pageTitle = BREADCRUMB_MAP[pathname] ?? "Admin";

  const handleLogout = async () => {
    await adminAuthService.logout().catch(() => { });
    clearAuth();
    window.location.href = "/admin/login";
  };

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-[#0D1526]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-slate-500">Vibly Admin</span>
        <ChevronRight className="size-3.5 text-slate-600" />
        <span className="text-slate-200 font-medium">{pageTitle}</span>
      </div>

      {/* Admin avatar + logout */}
      {admin && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-slate-200 leading-none">
              {admin.username ?? admin.email}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{admin.role}</p>
          </div>

          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      )}
    </header>
  );
}
