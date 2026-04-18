"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import adminApiClient, { adminTokenStorage, tokenGate } from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type { AdminRole, AdminUser } from "@/types/admin.types";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  requiredRole?: AdminRole;
}

interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    admin: { id: string; email: string; role: string };
  };
}

/**
 * Wraps admin dashboard routes.
 *
 * On every mount (including F5 refresh), calls /admin/auth/refresh
 * via the HTTP-Only cookie to silently verify the session.
 *
 * authStatus state machine:
 *   'checking'      — Initial state, show loading spinner
 *   'authenticated' — Session confirmed by server, render children
 *   'anonymous'     — No valid session, redirect to /admin/login
 */
export default function AdminAuthGuard({ children, requiredRole }: Props) {
  const router = useRouter();
  const { admin, authStatus, setAdmin, setTotpVerified, setAuthStatus, clearAuth, hasPermission } =
    useAdminAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      // ── Fast path: token already in RAM ──────────────────────────────────
      // This happens on normal client-side navigation (login → dashboard).
      // No need to call /refresh — the token is fresh and valid.
      if (adminTokenStorage.get()) {
        setAuthStatus("authenticated");
        tokenGate.open();
        return;
      }

      // ── Slow path: token wiped (F5 / module reload) ───────────────────────
      // RAM is empty but LocalStorage may have admin profile (persisted hint).
      // Must hit /refresh to get a new token via the HTTP-Only cookie.
      setAuthStatus("checking");

      try {
        // Fire silent refresh — browser auto-sends HTTP-Only cookie
        const { data } = await adminApiClient.post<RefreshResponse>(
          ADMIN_ENDPOINTS.auth.refresh,
        );

        if (cancelled) return;

        const { accessToken, admin: adminProfile } = data.data;

        // RBAC guard — belt-and-suspenders
        if (!["ADMIN", "MODERATOR"].includes(adminProfile.role)) {
          clearAuth();
          setAuthStatus("anonymous");
          tokenGate.close();
          router.replace("/admin/login");
          return;
        }

        // Restore in-memory token & confirm session
        adminTokenStorage.set(accessToken);
        setAdmin(adminProfile as AdminUser, accessToken);
        setTotpVerified();
        setAuthStatus("authenticated");
        // Open the gate — queued API requests can now fire
        tokenGate.open();
      } catch {
        if (cancelled) return;
        // Refresh failed (expired / no cookie) → wipe state and redirect
        clearAuth();
        setAuthStatus("anonymous");
        tokenGate.close();
        router.replace("/admin/login");
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only


  // Role check after auth confirmed
  useEffect(() => {
    if (authStatus === "authenticated" && requiredRole && !hasPermission(requiredRole)) {
      router.replace("/admin");
    }
  }, [authStatus, requiredRole, hasPermission, router]);

  // Loading state — show spinner while verifying
  if (authStatus === "checking") {
    return (
      <div className="min-h-screen bg-[#070D1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 text-sm">Verifying session…</p>
        </div>
      </div>
    );
  }

  // unauthenticated — redirect handles it, render nothing
  if (authStatus === "anonymous" || !admin) return null;

  // Role check — render nothing while redirect fires
  if (requiredRole && !hasPermission(requiredRole)) return null;

  return <>{children}</>;
}
