"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/password.schema";

// ─── ResetPasswordForm Component ─────────────────────────────────
// Client Component: reads token from searchParams, handles form
export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    // TODO: Replace with actual API call POST /auth/reset-password
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("[ResetPassword Mock]", { token, ...values });
    setIsLoading(false);
    setIsSuccess(true);
  };

  // Invalid / missing token
  if (!token) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h2 className="text-2xl font-bold font-heading text-foreground">
          Invalid reset link
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
        <Link href="/forgot-password">
          <Button className="rounded-xl mt-2">Request New Link</Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold font-heading text-foreground">
          Password updated!
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Your password has been successfully reset. You can now sign in with
          your new password.
        </p>
        <Link href="/login">
          <Button className="rounded-xl mt-2 font-semibold">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Heading ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Set new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Must be at least 8 characters with one uppercase letter and one number.
        </p>
      </div>

      {/* ── Form ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="rounded-xl h-11 pr-10"
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-10 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="rounded-xl h-11 pr-10"
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-10 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirm((p) => !p)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
