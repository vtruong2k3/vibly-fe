"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import adminAuthService from "@/lib/services/admin-auth.service";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { tokenGate } from "@/lib/api/admin-axios";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginForm() {
  const router = useRouter();
  const { setAdmin, setTotpVerified } = useAdminAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const result = await adminAuthService.login(values);

      // TOTP required — store tempToken in sessionStorage, redirect to verify page
      if ("requireTotp" in result && result.requireTotp) {
        sessionStorage.setItem("admin_temp_token", result.tempToken);
        router.replace("/admin/verify-2fa");
        return;
      }

      // Direct login — no TOTP
      const { accessToken, admin } = result as { accessToken: string; admin: { id: string; email: string; role: string } };

      // Guard: block non-admin roles even if API slips through
      if (!["ADMIN", "MODERATOR"].includes(admin.role)) {
        setServerError("Access denied. Admins and Moderators only.");
        return;
      }

      setAdmin(admin as any, accessToken);
      setTotpVerified();
      tokenGate.open();
      router.replace("/admin");
    } catch (err: unknown) {
      const status = (err as any)?.response?.status;
      if (status === 403) {
        setServerError("Access denied. This account is not authorized for admin access.");
      } else if (status === 429) {
        setServerError("Too many login attempts. Please wait a minute and try again.");
      } else {
        setServerError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="admin-email"
          className="text-xs font-medium text-slate-400"
        >
          Email address
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          placeholder="admin@vibly.com"
          {...register("email")}
          className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
        />
        {errors.email && (
          <p role="alert" className="text-xs text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="admin-password"
          className="text-xs font-medium text-slate-400"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className="w-full h-10 px-3 pr-10 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p role="alert" className="text-xs text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-xs text-red-400"
        >
          {serverError}
        </div>
      )}

      {/* Submit */}
      <button
        id="admin-login-submit"
        type="submit"
        disabled={isSubmitting}
        className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
