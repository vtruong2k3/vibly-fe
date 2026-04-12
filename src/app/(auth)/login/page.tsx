import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Vibly account — your digital sanctuary.",
};

// ─── Mock community proof data ───────────────────────────────────
const COMMUNITY_AVATARS = [
  { src: "https://i.pravatar.cc/40?u=a1", name: "User 1" },
  { src: "https://i.pravatar.cc/40?u=a2", name: "User 2" },
  { src: "https://i.pravatar.cc/40?u=a3", name: "User 3" },
  { src: "https://i.pravatar.cc/40?u=a4", name: "User 4" },
];

// ─── Login Page — Server Component ───────────────────────────────
export default function LoginPage() {
  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen flex">
      {/* ── Left: Branding ── */}
      <div className="hidden lg:flex flex-col flex-1 bg-primary relative overflow-hidden p-12 text-primary-foreground">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-12 w-48 h-48 bg-accent/20 rounded-full blur-2xl" />

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
            A digital sanctuary for{" "}
            <span className="text-white/80">meaningful</span>
            <br />
            connections.
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-sm">
            Experience a social space designed for clarity, intentionality,
            and your cognitive ease.
          </p>

          {/* Community Social Proof */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex -space-x-2">
              {COMMUNITY_AVATARS.map((avatar) => (
                <Avatar key={avatar.name} className="h-9 w-9 border-2 border-primary">
                  <AvatarImage src={avatar.src} alt={avatar.name} />
                  <AvatarFallback className="bg-white/20 text-white text-xs">
                    {avatar.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              <div className="h-9 w-9 rounded-full border-2 border-primary bg-white/20 backdrop-blur flex items-center justify-center">
                <span className="text-white text-xs font-semibold">+2k</span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 font-medium uppercase tracking-wider">
              Join our growing community
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="relative z-10 flex gap-6 text-xs text-primary-foreground/60 uppercase tracking-wider">
          <a href="/privacy" className="hover:text-primary-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-primary-foreground transition-colors">
            Terms of Service
          </a>
          <a href="/support" className="hover:text-primary-foreground transition-colors">
            Support
          </a>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-card">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm font-heading">V</span>
            </div>
            <span className="text-xl font-bold font-heading text-foreground">Vibly</span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
