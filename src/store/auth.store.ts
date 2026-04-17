import { create } from "zustand";
import { tokenStorage } from "@/lib/api/axios";
import { authService, type LoginDto, type RegisterDto } from "@/lib/services/auth.service";

// ─── Auth User shape ──────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: "USER" | "MODERATOR" | "ADMIN";
}

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;

  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (dto) => {
    const data = await authService.login(dto);
    tokenStorage.set(data.accessToken);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (dto) => {
    await authService.register(dto);
    // After register, backend sends verification email — no auto-login
  },

  // Called from /auth/callback after Google OAuth succeeds.
  // accessToken is extracted from the short-lived scoped cookie by the callback page.
  loginWithGoogle: async (accessToken: string) => {
    tokenStorage.set(accessToken);
    // Fetch full user profile now that we have a valid token
    const me = await authService.getMe();
    set({ user: me, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout().catch(() => {});
    tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
    
    // Force browser redirect to clean state
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearAuth: () => {
    tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },
}));

