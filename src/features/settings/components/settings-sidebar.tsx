"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { User, Lock, Bell, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  {
    title: "Account",
    id: "account",
    icon: User,
  },
  {
    title: "Privacy",
    id: "privacy",
    icon: Lock,
  },
  {
    title: "Notifications",
    id: "notifications",
    icon: Bell,
  },
  {
    title: "Security",
    id: "security",
    icon: Shield,
  },
  {
    title: "Xác minh",
    id: "verification",
    icon: ShieldCheck,
  },
];

export function SettingsSidebar() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "account";

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 mt-4 lg:mt-0 pb-4 overflow-x-auto lg:overflow-visible scrollbar-hide">
      {sidebarNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <Link
            key={item.id}
            href={`/settings?tab=${item.id}`}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
