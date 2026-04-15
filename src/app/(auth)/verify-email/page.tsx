"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/services/auth.service";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { isAxiosError } from "axios";

import { Suspense } from "react";

function VerifyEmailComponent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing verification token.");
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    async function verify() {
      try {
        await authService.verifyEmail({ token: token! });
        setStatus("success");
      } catch (error) {
        setStatus("error");
        if (isAxiosError(error) && error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Failed to verify email. The token might be invalid or expired.");
        }
      }
    }

    verify();
  }, [token]);

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl shadow-black/5 ring-1 ring-border">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-medium text-foreground">
              Verifying your email...
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your email address.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center py-8">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">
              Email Verified!
            </h2>
            <p className="text-sm text-muted-foreground">
              Thank you for verifying your email address. You can now access all Vibly features.
            </p>
            <Button
              className="mt-6 w-full rounded-xl"
              onClick={() => router.push("/login")}
            >
              Continue to Login
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center py-8">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">
              Verification Failed
            </h2>
            <Alert variant="destructive" className="mt-4 text-left">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mt-4">
              If your link expired, you can request a new verification email from the login page, or try registering again.
            </p>
            <div className="flex flex-col gap-3 w-full mt-6">
              <Button
                variant="default"
                className="w-full rounded-xl"
                onClick={() => router.push("/login")}
              >
                Go to Login
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
    <Suspense fallback={
      <div className="flex w-full min-h-screen items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailComponent />
    </Suspense>
  );
}
