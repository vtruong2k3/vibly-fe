"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { useAdminAuthStore } from '@/store/admin-auth.store';
import adminApiClient from '@/lib/api/admin-axios';
import { ADMIN_ENDPOINTS } from '@/lib/api/admin-constants';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const { admin, clearAuth } = useAdminAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await adminApiClient.post(ADMIN_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout failed on backend:', error);
    } finally {
      // Always clear local auth state regardless of BE success
      clearAuth();
      router.push('/admin/login');
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10 w-full">
      {/* Search */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
        </button>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <HelpCircle size={20} />
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-2" />

        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          <span className="text-sm font-medium text-gray-700 hidden md:inline">Quick Action</span>

          {/* User Profile Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-4 border-l border-gray-100 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold uppercase overflow-hidden shrink-0">
              {admin?.email?.charAt(0) || <User size={20} />}
            </div>
            <div className="hidden lg:flex flex-col items-start min-w-[80px]">
              <span className="text-sm font-bold text-gray-900 leading-tight">
                {admin?.username || admin?.email?.split('@')[0] || "Admin"}
              </span>
              <span className="text-xs font-semibold text-indigo-600 uppercase">
                {admin?.role || "ADMIN"}
              </span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 mb-2">
                <p className="text-sm font-medium text-slate-900 truncate">{admin?.email}</p>
                <p className="text-xs text-slate-500 mt-0.5">Manage your account</p>
              </div>

              <button
                onClick={() => { setIsDropdownOpen(false); router.push('/admin/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <SettingsIcon size={16} className="text-slate-400" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium disabled:opacity-50"
              >
                <LogOut size={16} className={isLoggingOut ? "animate-pulse" : ""} />
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
