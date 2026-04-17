import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AuthCallbackHandler } from "./callback-handler";


// ─── Suspense boundary required by Next.js for useSearchParams ────────────────
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Completing sign-in...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
