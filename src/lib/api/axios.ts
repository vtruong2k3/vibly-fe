import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, ENDPOINTS } from "./constants";

// ─── Token storage helpers ────────────────────────────────────────────────────
// Access token lives only in memory (not localStorage) for XSS safety.
// Refresh token is an HttpOnly cookie managed by the browser automatically.
let _accessToken: string | null = null;

export const tokenStorage = {
  get: () => _accessToken,
  set: (token: string | null) => { _accessToken = token; },
  clear: () => { _accessToken = null; },
};

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // needed so __Host-refresh cookie is sent for /refresh
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor — Attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — Auto refresh on 401 ───────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  refreshQueue.forEach((cb) => {
    if (error) cb.reject(error);
    else cb.resolve(token!);
  });
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401, and don't retry for the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(ENDPOINTS.auth.refresh)
    ) {
      if (isRefreshing) {
        // Queue up requests while a refresh is in flight
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data: envelope } = await apiClient.post<{
          success: boolean;
          data: { accessToken: string };
        }>(ENDPOINTS.auth.refresh);
        const newToken = envelope.data.accessToken;
        tokenStorage.set(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        // Redirect to login — works in both Server and Client contexts
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
