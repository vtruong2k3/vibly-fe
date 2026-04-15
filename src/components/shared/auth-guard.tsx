"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMe } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth.store";
import { tokenStorage } from "@/lib/api/axios";
import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";

// ─── Silent token restore ─────────────────────────────────────────────────────
// On every page load, _accessToken is null (memory-only).
// Try to silently get a fresh access token using the HttpOnly refresh cookie.
// "restored" = true  → refresh succeeded (or token already set) → allow useMe
// "restored" = false → refresh failed → user is not logged in → allow redirect
async function silentRefresh(): Promise<boolean> {
  // Already have a token in memory (e.g., same session, no reload)
  if (tokenStorage.get()) return true;

  try {
    // Backend wraps all responses: { success: true, data: { accessToken } }
    const { data: envelope } = await apiClient.post<{
      success: boolean;
      data: { accessToken: string };
    }>(ENDPOINTS.auth.refresh);
    tokenStorage.set(envelope.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // Phase 1: restore token from HttpOnly cookie before running useMe
  const [tokenRestored, setTokenRestored] = useState(false);
  const [restoreFailed, setRestoreFailed] = useState(false);

  useEffect(() => {
    silentRefresh().then((success) => {
      if (success) {
        setTokenRestored(true);
      } else {
        setRestoreFailed(true);
      }
    });
  }, []);

  // Phase 2: only query /users/me once we have (or confirmed we don't have) a token
  const { data: user, isLoading, isError } = useMe({ enabled: tokenRestored });
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const pathname = usePathname();
  const authStoreUser = useAuthStore((state) => state.user);

  // Sync fetched user into Zustand store
  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  // Redirect if refresh cookie is gone (restoreFailed) or /users/me returns error
  useEffect(() => {
    if (restoreFailed) {
      const redirectParams = pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.push(`/login${redirectParams}`);
      return;
    }

    if (tokenRestored && !isLoading && (isError || !user)) {
      const redirectParams = pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.push(`/login${redirectParams}`);
    }
  }, [restoreFailed, tokenRestored, isLoading, isError, user, router, pathname]);

  // Show loading while restoring token OR while /users/me is in flight
  if (!tokenRestored && !restoreFailed) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (tokenRestored && isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }


  // Prevent flashing protected content before redirect, and wait for Zustand sync
  if (restoreFailed || isError || !user || !authStoreUser) {
    return <div className="flex h-screen w-full items-center justify-center bg-background" />;
  }

  return <>{children}</>;
}
