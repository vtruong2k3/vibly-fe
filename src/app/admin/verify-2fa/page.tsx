import type { Metadata } from "next";

import { ShieldAlert } from "lucide-react";
import TotpVerifyForm from "@/features/admin/components/totp-verify-form";


export const metadata: Metadata = {
  title: "Two-Factor Auth — Vibly Admin",
  robots: { index: false, follow: false },
};

export default function AdminVerify2faPage() {
  return (
    <div className="min-h-screen bg-[#070D1A] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <ShieldAlert className="size-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">
            Vibly Admin
          </span>
        </div>

        <h1 className="text-xl font-semibold text-white mb-1">
          Two-factor authentication
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Enter the 6-digit code from your authenticator app to continue.
        </p>

        <TotpVerifyForm />
      </div>
    </div>
  );
}
