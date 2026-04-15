"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

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
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/password.schema";

// ─── ForgotPasswordForm Component ────────────────────────────────
// Client Component: requires form state + event handlers
export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    // TODO: Replace with actual API call POST /auth/forgot-password
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("[ForgotPassword Mock]", values);
    setIsLoading(false);
    setSubmittedEmail(values.email);
  };

  if (submittedEmail) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-heading text-foreground">
            Check your email
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-foreground">{submittedEmail}</span>.
            The link expires in 24 hours.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl"
            onClick={() => {
              setSubmittedEmail(null);
              form.reset();
            }}
          >
            Try a different email
          </Button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Heading ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Forgot password?
        </h1>
        <p className="text-sm text-muted-foreground">
          No worries — enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {/* ── Form ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </Form>

      {/* ── Back to Login ── */}
      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sign In
      </Link>
    </div>
  );
}
