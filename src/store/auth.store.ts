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

  logout: async () => {
    await authService.logout().catch(() => {});
    tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearAuth: () => {
    tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },
}));
