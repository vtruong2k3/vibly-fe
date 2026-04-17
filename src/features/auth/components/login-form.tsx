"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, MailWarning, Send } from "lucide-react";
import { useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/api/constants";
import { GoogleLoginButton } from "@/features/auth/components/google-login-button";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/lib/services/auth.service";

// ─── LoginForm Component ─────────────────────────────────────────
// Client Component: requires form state, event handlers
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const login = useAuthStore((s) => s.login);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setUnverifiedEmail(null);
    try {
      await login({ email: values.email, password: values.password });
      // Reset useMe query to clear any cached 'isError' state from when user was logged out
      await queryClient.resetQueries({ queryKey: QUERY_KEYS.me });
      toast.success("Welcome back!");
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        const responseData = error.response.data;
        // Check for structured error from backend (nested message object)
        const errorPayload =
          responseData?.message && typeof responseData.message === "object"
            ? responseData.message
            : responseData;

        if (errorPayload?.code === "UNVERIFIED_EMAIL") {
          setUnverifiedEmail(errorPayload.email || values.email);
        } else {
          const msg =
            typeof responseData.message === "string"
              ? responseData.message
              : "An unexpected error occurred. Please try again.";
          toast.error(msg);
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    try {
      await authService.resendVerifyEmail({ email: unverifiedEmail });
      toast.success("Verification email sent! Please check your inbox.");
    } catch {
      toast.error("Failed to resend. Please try again shortly.");
    } finally {
      setIsResending(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* ── Heading ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Log in to your digital sanctuary
        </p>
      </div>

      {/* ── Unverified Email Alert ── */}
      {unverifiedEmail && (
        <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <MailWarning className="h-4 w-4 !text-amber-500" />
          <AlertTitle className="font-semibold">Verify your email</AlertTitle>
          <AlertDescription className="mt-1 space-y-3">
            <p className="text-sm">
              Check your inbox at <span className="font-medium">{unverifiedEmail}</span> and click the link to activate your account.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-2 border-amber-500/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {isResending ? "Sending..." : "Resend verification email"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Social Login ── */}
      <div className="grid grid-cols-2 gap-3">
        <GoogleLoginButton disabled={isLoading} />
        <Button
          variant="outline"
          type="button"
          className="rounded-xl gap-2"
          disabled
          title="Coming soon"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#1877F2" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </Button>
      </div>

      {/* ── Divider ── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            or login with
          </span>
        </div>
      </div>

      {/* ── Form ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="rounded-xl h-11"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline underline-offset-4"
                  >
                    Forgot?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="rounded-xl h-11 pr-10"
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-10 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me */}
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-border accent-primary"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormLabel htmlFor="rememberMe" className="font-normal text-muted-foreground cursor-pointer">
                  Stay logged in for 30 days
                </FormLabel>
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      {/* ── Register Link ── */}
      <p className="text-center text-sm text-muted-foreground">
        New to Vibly?{" "}
        <Link
          href="/register"
          className="text-primary font-medium hover:underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
