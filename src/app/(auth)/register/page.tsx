import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create Account — Vibly",
  description:
    "Join Vibly and start building meaningful connections today.",
};

// ─── Register Page — Server Component ────────────────────────────
export default function RegisterPage() {
  return (
    <div className="w-full min-h-screen flex">
      {/* ── Left: Branding ── */}
      <div className="hidden lg:flex flex-col w-1/2 bg-primary relative overflow-hidden p-12 text-primary-foreground min-h-screen">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg font-heading">V</span>
            </div>
            <span className="text-2xl font-bold font-heading">Vibly</span>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-6">
          <h2 className="text-4xl xl:text-5xl font-bold font-heading leading-tight">
            Your community
            <br />
            awaits{" "}
            <span className="text-white/80">you.</span>
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-sm">
            Sign up in seconds. Start sharing, connecting, and discovering with
            people who matter.
          </p>

          {/* Steps */}
          <ol className="space-y-3 pt-2">
            {[
              "Create your profile",
              "Find and follow friends",
              "Share thoughts & moments",
            ].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-primary-foreground/80 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer links */}
        <div className="relative z-10 flex gap-6 text-xs text-primary-foreground/60 uppercase tracking-wider">
          <a href="/privacy" className="hover:text-primary-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-primary-foreground transition-colors">
            Terms of Service
          </a>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-card min-h-screen overflow-y-auto">
        <div className="w-full max-w-sm py-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm font-heading">
                V
              </span>
            </div>
            <span className="text-xl font-bold font-heading text-foreground">
              Vibly
            </span>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
