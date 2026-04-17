"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/api/constants";

// ─── Callback Cookie Helper ────────────────────────────────────────────────────
function extractAndClearOAuthCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    /(^|;\s*)oauth_access_token=([^;]+)/,
  );
  const token = match ? decodeURIComponent(match[2]) : null;

  if (token) {
    // Immediately purge — single-use, path-scoped to /auth/callback
    document.cookie =
      "oauth_access_token=; Max-Age=0; path=/auth/callback; SameSite=Lax";
  }

  return token;
}

// ─── Error Reason Mapping ──────────────────────────────────────────────────────
function getFriendlyError(raw: string): string {
  if (raw.includes("already exists")) {
    return "This email is registered with password sign-in. Please use email & password instead.";
  }
  if (raw.includes("not verified")) {
    return "Your Google account email is not verified. Please verify it first.";
  }
  if (raw.includes("state")) {
    return "Security check failed. Please try signing in again.";
  }
  if (raw.includes("suspended")) {
    return "Your account has been suspended. Contact support.";
  }
  return "Google sign-in failed. Please try again.";
}

// ─── Callback Handler (Client Component) ──────────────────────────────────────
// Separated so it can be wrapped in <Suspense> in the parent page.tsx
export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  useEffect(() => {
    // Guard against React Strict Mode double-invoke
    if (hasRun.current) return;
    hasRun.current = true;

    const authStatus = searchParams.get("auth");

    if (authStatus === "error") {
      const rawReason = searchParams.get("reason") ?? "oauth_error";
      const friendly = getFriendlyError(decodeURIComponent(rawReason));
      toast.error(friendly, { duration: 6000 });
      router.replace("/login");
      return;
    }

    if (authStatus === "success") {
      const token = extractAndClearOAuthCookie();

      if (!token) {
        // Cookie missing — expired (>60s) or already consumed
        toast.error("Session expired. Please try signing in again.");
        router.replace("/login");
        return;
      }

      loginWithGoogle(token)
        .then(async () => {
          // Refresh cached user data so layout/guards update immediately
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me });
          toast.success("Welcome! You're signed in with Google.");
          router.replace("/");
        })
        .catch(() => {
          toast.error("Failed to load your profile. Please try again.");
          router.replace("/login");
        });

      return;
    }

    // Unknown state — redirect safely
    router.replace("/login");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Completing sign-in...</p>
      </div>
    </div>
  );
}
