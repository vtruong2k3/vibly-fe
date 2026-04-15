import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password — Vibly",
  description: "Reset your Vibly account password via email.",
};

// ─── Forgot Password Page — Server Component ──────────────────────
export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6 min-h-screen flex items-center justify-center">
      <div className="w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-heading">
              V
            </span>
          </div>
          <span className="text-xl font-bold font-heading text-foreground">
            Vibly
          </span>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
