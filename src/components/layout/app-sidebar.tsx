"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  MessageCircle,
  Bell,
  Settings,
  PenSquare,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserHeader } from "@/components/shared/user-header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MOCK_CURRENT_USER } from "@/lib/mock-data/feed";

// ─── Nav Item Types ───────────────────────────────────────────────
interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// ─── Nav Config ───────────────────────────────────────────────────
const NAV_ITEMS: SidebarNavItem[] = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Friends", href: "/friends", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

// ─── Component ───────────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <aside className="flex flex-row md:flex-col items-center md:items-stretch h-[65px] md:h-full w-full md:w-20 lg:w-64 border-t md:border-t-0 md:border-r border-border bg-sidebar shrink-0 transition-all duration-300 md:pb-6 z-40">
      {/* ── Logo ── */}
      <div className="hidden md:flex items-center gap-3 px-4 py-6 lg:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shrink-0">
          <span className="text-primary-foreground font-bold text-sm font-heading">V</span>
        </div>
        <span className="hidden lg:block text-xl font-bold font-heading text-foreground">
          Vibly
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-2 md:px-3 lg:px-4 py-0 md:py-2 md:space-y-1.5 w-full md:w-auto h-full md:h-auto items-center md:items-stretch">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3.5 px-0 md:px-3.5 py-2 md:py-3 rounded-2xl text-[10px] md:text-[15px] transition-all duration-200 group w-full md:w-auto",
                    isActive
                      ? "md:bg-primary md:text-primary-foreground text-primary font-semibold md:shadow-sm"
                      : "text-muted-foreground font-medium hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-[24px] w-[24px] md:h-[22px] md:w-[22px] shrink-0 transition-transform group-hover:scale-105", isActive && "stroke-[2.5px]")} />
                  <span className="hidden lg:block">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="hidden md:block lg:hidden">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* ── Create Post Button ── */}
      <div className="hidden md:block px-3 lg:px-4 pb-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="w-full justify-start lg:justify-center gap-3 rounded-full h-12 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
              size="default"
            >
              <PenSquare className="h-5 w-5 shrink-0" />
              <span className="hidden lg:block font-bold text-[15px]">Create Post</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="lg:hidden">
            Create Post
          </TooltipContent>
        </Tooltip>
      </div>

      {/* ── User Profile + Theme Toggle ── */}
      <div className="hidden md:block px-3 lg:px-4 py-4 mt-auto">
        <div className="flex items-center justify-between p-2 lg:p-3 rounded-2xl hover:bg-muted/50 transition-colors mx-[-8px]">
          <UserHeader
            user={MOCK_CURRENT_USER}
            size="md"
            withLink={false}
            className="hidden lg:flex"
          />
          <div className="hidden lg:flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
              aria-label="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
