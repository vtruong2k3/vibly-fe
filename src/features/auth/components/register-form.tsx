"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";

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
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/lib/services/auth.service";

// ─── Resend Email sub-component ──────────────────────────────────
function ResendButton({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await authService.resendVerifyEmail({ email });
      setSent(true);
      toast.success("Verification email resent! Check your inbox.");
    } catch {
      toast.error("Could not send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <p className="text-sm text-muted-foreground">
      Didn&apos;t receive it?{" "}
      <button
        type="button"
        onClick={handleResend}
        disabled={sending || sent}
        className="inline-flex items-center gap-1 text-primary font-medium hover:underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</>
        ) : sent ? (
          "Email sent ✓"
        ) : (
          <><Send className="h-3.5 w-3.5" /> Resend email</>
        )}
      </button>
    </p>
  );
}

// ─── Password strength helper ─────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Weak", color: "bg-destructive" },
    { label: "Fair", color: "bg-orange-400" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-emerald-500" },
    { label: "Very Strong", color: "bg-emerald-600" },
  ];
  return { score, ...levels[Math.min(score, 4)] };
}

// ─── RegisterForm Component ───────────────────────────────────────
// Client Component: requires form state + event handlers
export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const register = useAuthStore((s) => s.register);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const passwordValue = form.watch("password");
  const strength = getPasswordStrength(passwordValue);

  const login = useAuthStore((s) => s.login);

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register({
        email: values.email,
        username: values.username,
        password: values.password,
        displayName: values.displayName,
      });
      // Show "Check inbox" screen (email has been sent)
      setIsSuccess(true);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Network or Registration error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  if (isSuccess) {
    const registeredEmail = form.getValues("email");

    return (
      <div className="flex flex-col items-center text-center py-4 space-y-6">
        {/* Animated icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full bg-emerald-500/10 animate-ping" />
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-heading text-foreground">
            Check your inbox!
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-semibold text-foreground">{registeredEmail}</span>.
            Click the link in the email to activate your account.
          </p>
        </div>

        {/* Steps guide */}
        <div className="w-full rounded-xl border border-border bg-muted/30 p-4 text-left space-y-3">
          {[
            { step: "1", text: "Open your email app" },
            { step: "2", text: 'Find email from "Vibly"' },
            { step: "3", text: 'Click "Verify my email" button' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {step}
              </span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* Resend */}
        <ResendButton email={registeredEmail} />

        <Link
          href="/login"
          className="inline-block text-sm text-primary font-medium hover:underline underline-offset-4"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Heading ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join thousands building meaningful connections
        </p>
      </div>
      {/* ── Social Login ── */}
      <div className="grid grid-cols-2 gap-3">
        <GoogleLoginButton disabled={isLoading} />
        <Button variant="outline" type="button" className="rounded-xl gap-2" disabled title="Coming soon">
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
            or sign up with email
          </span>
        </div>
      </div>

      {/* ── Form ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Display Name */}
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your full name"
                    autoComplete="name"
                    className="rounded-xl h-11"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                      @
                    </span>
                    <Input
                      placeholder="yourhandle"
                      autoComplete="username"
                      className="rounded-xl h-11 pl-7"
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormLabel>Password</FormLabel>
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
                {/* Strength bar */}
                {passwordValue && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i < strength.score
                              ? strength.color
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Strength: {strength.label}
                    </p>
                  </div>
                )}
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
                <FormLabel>Confirm Password</FormLabel>
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

          {/* Agree to Terms */}
          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem className="flex items-start gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 mt-0.5 rounded border-border accent-primary cursor-pointer"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormLabel
                  htmlFor="agreeToTerms"
                  className="font-normal text-muted-foreground cursor-pointer leading-snug"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>

      {/* ── Login Link ── */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
