"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Flag,
  ShieldAlert,
  BarChart3,
  ScrollText,
  UserCog,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { cn } from "@/lib/utils";

const P0_NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/users", icon: Users, label: "Users", exact: false },
  { href: "/admin/content/posts", icon: FileText, label: "Posts", exact: false },
  { href: "/admin/content/comments", icon: MessageSquare, label: "Comments", exact: false },
  { href: "/admin/reports", icon: Flag, label: "Reports", exact: false },
] as const;

// P1 — visible to all authenticated admins, but some actions are ADMIN-only
const P1_NAV = [
  { href: "/admin/audit-log", icon: ScrollText, label: "Audit Log" },
  { href: "/admin/admins", icon: UserCog, label: "Admins & Roles", adminOnly: true },
] as const;

function NavItem({
  href,
  icon: Icon,
  label,
  exact = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-500/10 text-blue-400"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

export default function AdminSidebar() {
  const { hasPermission } = useAdminAuthStore();

  const visibleP1 = P1_NAV.filter(
    (item) => !("adminOnly" in item) || !item.adminOnly || hasPermission("ADMIN"),
  );

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-white/5 bg-[#0D1526]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <ShieldAlert className="size-5 text-blue-400" />
        <span className="font-semibold text-white text-sm tracking-wide">
          Vibly Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {/* P0 core */}
        {P0_NAV.map(({ href, icon, label, exact }) => (
          <NavItem key={href} href={href} icon={icon} label={label} exact={exact ?? false} />
        ))}

        {/* P1 separator */}
        {visibleP1.length > 0 && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                Insights
              </p>
            </div>
            {visibleP1.map(({ href, icon, label }) => (
              <NavItem key={href} href={href} icon={icon} label={label} />
            ))}
          </>
        )}
      </nav>

      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-xs text-slate-700">Internal — confidential</p>
      </div>
    </aside>
  );
}
