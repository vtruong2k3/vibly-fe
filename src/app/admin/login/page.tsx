import type { Metadata } from "next";

import { ShieldAlert } from "lucide-react";
import AdminLoginForm from "@/features/admin/components/admin-login-form";


export const metadata: Metadata = {
  title: "Admin Login — Vibly",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#070D1A] flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#0B1526] border-r border-white/5 p-10">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="size-5 text-blue-400" />
          <span className="font-semibold text-white text-sm tracking-wide">
            Vibly Admin
          </span>
        </div>

        <div>
          <blockquote className="text-slate-400 text-sm leading-relaxed">
            "With great access comes great responsibility. Every action you take
            is logged and auditable."
          </blockquote>
          <p className="text-slate-600 text-xs mt-3">
            — Internal security policy
          </p>
        </div>

        <p className="text-xs text-slate-700">
          Access restricted to authorized personnel only.
        </p>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <ShieldAlert className="size-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">
              Vibly Admin
            </span>
          </div>

          <h1 className="text-xl font-semibold text-white mb-1">
            Sign in to dashboard
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Admin and Moderator accounts only.
          </p>

          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
