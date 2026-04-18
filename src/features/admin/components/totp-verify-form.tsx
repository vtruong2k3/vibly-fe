"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import adminAuthService from "@/lib/services/admin-auth.service";
import { tokenGate } from "@/lib/api/admin-axios";
import { cn } from "@/lib/utils";

const CODE_LENGTH = 6;

export default function TotpVerifyForm() {
  const router = useRouter();
  const { isAuthenticated, setAdmin, setTotpVerified } = useAdminAuthStore();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Guard: no session at all → go to login
  useEffect(() => {
    const tempToken = sessionStorage.getItem("admin_temp_token");
    // If already authenticated (direct login without TOTP), redirect out
    if (isAuthenticated) {
      router.replace("/admin");
      return;
    }
    // If no tempToken, user shouldn't be here
    if (!tempToken) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, router]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit on last digit
    if (digit && index === CODE_LENGTH - 1) {
      const code = next.join("");
      if (code.length === CODE_LENGTH) void submit(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (pasted.length === CODE_LENGTH) {
      setDigits(pasted.split(""));
      void submit(pasted);
    }
  };

  const submit = async (code: string) => {
    const tempToken = sessionStorage.getItem("admin_temp_token");
    if (!tempToken) {
      setError("Session expired. Please log in again.");
      router.replace("/admin/login");
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      const result = await adminAuthService.verifyTotp(code, tempToken);
      // Clean up temp token
      sessionStorage.removeItem("admin_temp_token");
      // Store full auth state
      setAdmin(result.admin, result.accessToken);
      setTotpVerified();
      tokenGate.open();
      router.replace("/admin");
    } catch (err: unknown) {
      const status = (err as any)?.response?.status;
      if (status === 401) {
        setError("Invalid code. Please check your authenticator app and try again.");
      } else if (status === 429) {
        setError("Too many attempts. Please wait a moment.");
      } else {
        setError("Verification failed. Please try again.");
      }
      setDigits(Array(CODE_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* OTP input grid */}
      <div
        className="flex gap-2 justify-center"
        onPaste={handlePaste}
        role="group"
        aria-label="One-time password input"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            id={`totp-digit-${i}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isPending}
            className={cn(
              "w-11 h-14 text-center text-xl font-bold rounded-lg",
              "bg-white/5 border transition-all",
              "text-white caret-blue-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50",
              "disabled:opacity-40",
              error
                ? "border-red-500/40 bg-red-500/5"
                : "border-white/10 hover:border-white/20",
            )}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-center text-xs text-red-400">
          {error}
        </p>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="flex justify-center">
          <Loader2 className="size-5 text-blue-400 animate-spin" />
        </div>
      )}

      {/* Manual submit */}
      {!isPending && (
        <button
          id="totp-submit"
          type="button"
          onClick={() => submit(digits.join(""))}
          disabled={digits.join("").length < CODE_LENGTH}
          className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck className="size-4" />
          Verify
        </button>
      )}

      <p className="text-center text-xs text-slate-600">
        Lost access?{" "}
        <a href="#" className="text-slate-400 hover:text-white underline underline-offset-2">
          Use a backup code
        </a>
      </p>
    </div>
  );
}
