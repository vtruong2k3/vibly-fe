"use client";

import { Bell, Moon, Sun, MessageCircle, Settings, LogOut, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GlobalSearch } from "@/features/search/components/global-search";
import { useAuthStore } from "@/store/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationStore } from "@/store/notifications.store";

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[65px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left/Center: Search Bar */}
        <div className="flex-1 flex justify-start lg:justify-center">
          <GlobalSearch />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:bg-muted/60"
                asChild
              >
                <Link href="/messages">
                  <MessageCircle className="h-5 w-5" />
                  <span className="sr-only">Nhắn tin</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Nhắn tin</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:bg-muted/60 relative"
                asChild
                onClick={markAllRead}
              >
                <Link href="/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white leading-none animate-in zoom-in-50 duration-200">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Thông báo</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Thông báo{unreadCount > 0 ? ` (${unreadCount})` : ""}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full text-muted-foreground hover:bg-muted/60"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Đổi giao diện</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Đổi giao diện</TooltipContent>
          </Tooltip>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 outline-none">
                <Avatar className="h-8 w-8 transition-transform hover:scale-105 active:scale-95 ring-2 ring-transparent focus-visible:ring-primary">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-heading font-bold text-xs">
                    {user.displayName?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                <DropdownMenuItem 
                  onClick={() => window.location.href = `/profile/${user.username}`}
                  className="cursor-pointer py-2.5 focus:bg-primary focus:text-primary-foreground focus:**:text-primary-foreground"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Trang cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = `/settings`}
                  className="cursor-pointer py-2.5 focus:bg-primary focus:text-primary-foreground focus:**:text-primary-foreground"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt & Quyền riêng tư</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => useAuthStore.getState().logout()}
                  className="cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive focus:**:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

        </div>
      </div>
    </header>
  );
}
