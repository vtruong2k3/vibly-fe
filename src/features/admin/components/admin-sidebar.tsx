"use client";

import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertCircle,
  Users2,
  MessageSquare,
  BarChart3,
  Settings,
  ShieldUser
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { id: 'overview', href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', href: '/admin/users', label: 'Users', icon: Users },
  { id: 'posts', href: '/admin/posts', label: 'Posts', icon: FileText },
  { id: 'reports', href: '/admin/reports', label: 'Reports', icon: AlertCircle },
  { id: 'communities', href: '/admin/communities', label: 'Communities', icon: Users2 },
  { id: 'messages', href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { id: 'analytics', href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 overflow-y-auto shrink-0 z-20">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          L
        </div>
        <div>
          <h1 className="font-bold text-gray-900 leading-none">LoopSpace Admin</h1>
          <p className="text-xs text-gray-500 mt-1">Network Control</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          // Compare exact for overview, else prefix
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);

          return (
            <Link
              href={item.href}
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <item.icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-4 w-1 h-4 bg-indigo-600 rounded-full"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Action */}
      <div className="p-4 mt-auto">
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors">
          <ShieldUser size={18} />
          <span>Moderation Queue</span>
        </button>
      </div>
    </aside>
  );
}
