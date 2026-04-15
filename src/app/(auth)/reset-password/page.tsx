import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Reset Password — Vibly",
  description: "Set a new password for your Vibly account.",
};

// ─── Reset Password Page — Server Component ───────────────────────
// Wraps form in Suspense because ResetPasswordForm uses useSearchParams()
export default function ResetPasswordPage() {
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

        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
