"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { QUERY_KEYS } from "@/lib/api/constants";


// ─── Callback Cookie Helper ────────────────────────────────────────────────────
function extractAndClearOAuthCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    /(^|;\s*)oauth_access_token=([^;]+)/,
  );
  const token = match ? decodeURIComponent(match[2]) : null;

  if (token) {
    // Immediately purge the cookie — single-use, scoped to /auth/callback
    document.cookie =
      "oauth_access_token=; Max-Age=0; path=/auth/callback; SameSite=Lax";
  }

  return token;
}

// ─── Error Reason Mapping ──────────────────────────────────────────────────────
function getFriendlyError(raw: string): string {
  if (raw.includes("already exists")) {
    return "This email is registered with a password account. Please sign in with email & password.";
  }
  if (raw.includes("not verified")) {
    return "Your Google email is not verified. Please verify your Google account first.";
  }
  if (raw.includes("state")) {
    return "Security check failed (CSRF). Please try signing in again.";
  }
  if (raw.includes("suspended")) {
    return "Your account has been suspended.";
  }
  return "Sign-in failed. Please try again.";
}

// ─── Auth Callback Page ───────────────────────────────────────────────────────
// This page is the landing target after Google redirects back from OAuth.
// ?auth=success → read one-time cookie, store token, redirect to home
// ?auth=error   → show error toast, redirect to /login
export default function AuthCallbackPage() {
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
      router.replace(`/login`);
      return;
    }

    if (authStatus === "success") {
      const token = extractAndClearOAuthCookie();

      if (!token) {
        // Cookie missing — could be timing issue (>60s) or already consumed
        toast.error("Session cookie not found. Please try signing in again.");
        router.replace("/login");
        return;
      }

      loginWithGoogle(token)
        .then(async () => {
          // Invalidate the 'me' query so any listener (navbar, guards) refreshes
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me });
          toast.success("Welcome! You're now signed in.");
          router.replace("/");
        })
        .catch(() => {
          toast.error("Failed to load your profile. Please try again.");
          router.replace("/login");
        });

      return;
    }

    // Unknown state — redirect away
    router.replace("/login");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Completing sign-in...</p>
      </div>
    </div>
  );
}
