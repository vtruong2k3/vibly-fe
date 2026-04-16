"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/services/auth.service";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { isAxiosError } from "axios";
import { Suspense } from "react";

// ─── Countdown redirect after success ────────────────────────────
function CountdownRedirect({ to }: { to: string }) {
  const router = useRouter();
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) {
      router.push(to);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, router, to]);

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>
        Redirecting to login in{" "}
        <span className="font-semibold text-foreground tabular-nums">{count}</span>s…
      </span>
    </div>
  );
}

// ─── Main Verify Email Component ──────────────────────────────────
function VerifyEmailComponent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing verification token. Please use the link from your email.");
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    async function verify() {
      try {
        await authService.verifyEmail({ token: token! });
        setStatus("success");
        toast.success("Email verified! You can now log in.");
      } catch (error) {
        setStatus("error");
        if (isAxiosError(error) && error.response?.data?.message) {
          setErrorMessage(
            typeof error.response.data.message === "string"
              ? error.response.data.message
              : "Failed to verify email. The token might be invalid or expired."
          );
        } else {
          setErrorMessage("Failed to verify email. The token might be invalid or expired.");
        }
      }
    }

    verify();
  }, [token]);

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 shadow-xl shadow-black/5 ring-1 ring-border">

        {/* ── Loading ── */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-5 py-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-20 w-20 rounded-full bg-primary/10 animate-ping opacity-60" />
              <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Verifying your email…</h2>
              <p className="text-sm text-muted-foreground">
                Please wait while we confirm your email address.
              </p>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-6 text-center py-4">
            {/* Animated check */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full bg-emerald-500/10 animate-ping" />
              <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                Email Verified! 🎉
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Your account is now active. Welcome to Vibly — start building meaningful connections.
              </p>
            </div>

            {/* CTA */}
            <Button
              className="w-full h-11 rounded-xl font-semibold"
              onClick={() => window.location.href = "/login"}
            >
              Continue to Login
            </Button>

            {/* Auto-redirect countdown */}
            <CountdownRedirect to="/login" />
          </div>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-5 text-center py-4">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                Verification Failed
              </h2>
              <p className="text-sm text-muted-foreground">
                We couldn't verify your email address.
              </p>
            </div>

            <Alert variant="destructive" className="text-left w-full">
              <AlertTitle>Error details</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground">
              If your link expired, you can request a new one from the login page.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Button
                className="w-full h-11 rounded-xl font-semibold"
                onClick={() => window.location.href = "/login"}
              >
                Go to Login
              </Button>
              <Button variant="ghost" className="w-full rounded-xl" asChild>
                <Link href="/register">Create a new account</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailComponent />
    </Suspense>
  );
}
