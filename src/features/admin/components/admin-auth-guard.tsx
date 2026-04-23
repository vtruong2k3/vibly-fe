"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { tokenGate, adminTokenStorage } from "@/lib/api/admin-axios";
import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";

async function silentRefresh(
    setAdmin: ReturnType<typeof useAdminAuthStore.getState>["setAdmin"],
    setAuthStatus: ReturnType<typeof useAdminAuthStore.getState>["setAuthStatus"],
    clearAuth: ReturnType<typeof useAdminAuthStore.getState>["clearAuth"],
) {
    try {
        const { data } = await adminApiClient.post<{
            success: boolean;
            data: {
                accessToken: string;
                admin: { id: string; email: string; username?: string; role: "ADMIN" | "MODERATOR" };
            };
        }>(ADMIN_ENDPOINTS.auth.refresh);

        const { accessToken, admin } = data.data;
        setAdmin(admin, accessToken);
        tokenGate.open();
        setAuthStatus("authenticated");
    } catch {
        clearAuth();
        tokenGate.close();
        setAuthStatus("anonymous");
    }
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { authStatus, setAdmin, setAuthStatus, clearAuth } = useAdminAuthStore();

    useEffect(() => {
        // If already authenticated in this tab (token still in RAM), open gate + done.
        if (adminTokenStorage.get()) {
            tokenGate.open();
            setAuthStatus("authenticated");
            return;
        }

        // Token was lost (F5 / page reload) — always attempt silent refresh via
        // the HttpOnly refresh cookie. The middleware already confirmed the cookie
        // exists before rendering this page.
        silentRefresh(setAdmin, setAuthStatus, clearAuth);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (authStatus === "anonymous") {
            router.replace("/admin/login");
        }
    }, [authStatus, router]);

    if (authStatus === "checking") {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 animate-pulse" />
                    <p className="text-sm font-semibold text-slate-400">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (authStatus === "anonymous") return null;

    return <>{children}</>;
}
