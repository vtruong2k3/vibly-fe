import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { adminTokenStorage } from "@/lib/api/admin-axios";
import type { AdminRole, AdminUser } from "@/types/admin.types";

export type AuthStatus = "checking" | "authenticated" | "anonymous";

interface AdminAuthState {
  admin: AdminUser | null;
  authStatus: AuthStatus;
  /** @deprecated use authStatus === 'authenticated' */
  isAuthenticated: boolean;
  isTotpVerified: boolean;

  setAdmin: (admin: AdminUser, token: string) => void;
  setTotpVerified: () => void;
  setAuthStatus: (status: AuthStatus) => void;
  clearAuth: () => void;
  hasPermission: (required: AdminRole) => boolean;
}

// Role hierarchy — higher index = higher rank
const ROLE_RANK: Record<AdminRole, number> = {
  MODERATOR: 1,
  ADMIN: 2,
};

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      authStatus: "checking",
      isAuthenticated: false,
      isTotpVerified: false,

      setAdmin: (admin, token) => {
        adminTokenStorage.set(token);
        set({ admin, isAuthenticated: true, authStatus: "authenticated" });
      },

      setTotpVerified: () => set({ isTotpVerified: true }),

      setAuthStatus: (status) =>
        set({
          authStatus: status,
          isAuthenticated: status === "authenticated",
        }),

      clearAuth: () => {
        adminTokenStorage.clear();
        set({
          admin: null,
          isAuthenticated: false,
          isTotpVerified: false,
          authStatus: "anonymous",
        });
      },

      hasPermission: (required) => {
        const { admin } = get();
        if (!admin) return false;
        return ROLE_RANK[admin.role] >= ROLE_RANK[required];
      },
    }),
    {
      name: "admin-auth-storage",
      storage: createJSONStorage(() => localStorage),
      // SECURITY: Only persist non-sensitive identity data.
      // accessToken stays in RAM only (adminTokenStorage) — never localStorage.
      partialize: (state) => ({
        admin: state.admin,
        isTotpVerified: state.isTotpVerified,
        // authStatus is NOT persisted — always re-verified on mount
      }),
    },
  ),
);
