import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";


// Access token lives in memory only — never localStorage
let _adminToken: string | null = null;

export const adminTokenStorage = {
  get: () => _adminToken,
  set: (token: string | null) => { _adminToken = token; },
  clear: () => { _adminToken = null; },
};

// ─── Token Ready Gate ─────────────────────────────────────────────────────────
// Allows API requests to queue while the guard is running the silent refresh.
// Once the guard sets the token via adminTokenStorage.set(), call resolveTokenReady().
let _tokenReadyResolve: (() => void) | null = null;
let _tokenReadyPromise: Promise<void> | null = null;
let _tokenIsReady = false;

export const tokenGate = {
  /** Called by AdminAuthGuard after successful silent refresh */
  open: () => {
    _tokenIsReady = true;
    _tokenReadyResolve?.();
    _tokenReadyResolve = null;
  },
  /** Called by AdminAuthGuard.clearAuth to reset the gate for next login */
  close: () => {
    _tokenIsReady = false;
    _tokenReadyPromise = null;
    _tokenReadyResolve = null;
  },
  /** Returns a promise that resolves once the token is available */
  wait: (): Promise<void> => {
    if (_tokenIsReady) return Promise.resolve();
    if (!_tokenReadyPromise) {
      _tokenReadyPromise = new Promise<void>((resolve) => {
        _tokenReadyResolve = resolve;
      });
    }
    return _tokenReadyPromise;
  },
};

// Separate Axios instance from user client —
// different base path, different cookie namespace
export const adminApiClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor ─────────────────────────────────────────────────────
// Skip the gate for auth endpoints (login, refresh) — they don't need a token
adminApiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isAuthEndpoint =
      config.url?.includes("/admin/auth/login") ||
      config.url?.includes("/admin/auth/refresh") ||
      config.url?.includes("/admin/auth/totp/verify");

    // Non-auth endpoints wait until the guard has set the token
    if (!isAuthEndpoint) {
      await tokenGate.wait();
    }

    const token = adminTokenStorage.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Auto-refresh queue (Single-Flight) ──────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(err: unknown, token: string | null = null) {
  refreshQueue.forEach((cb) =>
    err ? cb.reject(err) : cb.resolve(token!),
  );
  refreshQueue = [];
}

adminApiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const is401 =
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes(ADMIN_ENDPOINTS.auth.refresh);

    if (!is401) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return adminApiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await adminApiClient.post<{
        success: boolean;
        data: {
          accessToken: string;
          admin: { id: string; email: string; role: string };
        };
      }>(ADMIN_ENDPOINTS.auth.refresh);

      const newToken = data.data.accessToken;
      adminTokenStorage.set(newToken);
      tokenGate.open();
      drainQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return adminApiClient(original);
    } catch (err) {
      drainQueue(err, null);
      // Clear both in-memory token AND persisted Zustand store
      adminTokenStorage.clear();
      tokenGate.close();
      // Dynamically import to avoid circular dependency
      if (typeof window !== "undefined") {
        import("@/store/admin-auth.store").then(({ useAdminAuthStore }) => {
          useAdminAuthStore.getState().clearAuth();
        });
        window.location.href = "/admin/login";
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default adminApiClient;
