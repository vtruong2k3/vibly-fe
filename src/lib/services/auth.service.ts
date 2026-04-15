import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";

// ─── DTOs (matching backend schema exactly) ───────────────────────────────────
export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    role: "USER" | "MODERATOR" | "ADMIN";
  };
}

export interface VerifyEmailDto {
  token: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  register: (dto: RegisterDto) =>
    apiClient.post(ENDPOINTS.auth.register, dto).then((r) => r.data),

  login: (dto: LoginDto) =>
    apiClient
      .post<{ success: boolean; data: LoginResponse }>(ENDPOINTS.auth.login, dto)
      .then((r) => r.data.data),

  logout: () =>
    apiClient.post(ENDPOINTS.auth.logout).then((r) => r.data),

  logoutAll: () =>
    apiClient.post(ENDPOINTS.auth.logoutAll).then((r) => r.data),

  verifyEmail: (dto: VerifyEmailDto) =>
    apiClient.post(ENDPOINTS.auth.verifyEmail, dto).then((r) => r.data),

  resendVerifyEmail: (dto: { email: string }) =>
    apiClient.post(ENDPOINTS.auth.resendVerifyEmail, dto).then((r) => r.data),

  forgotPassword: (dto: ForgotPasswordDto) =>
    apiClient.post(ENDPOINTS.auth.forgotPassword, dto).then((r) => r.data),

  resetPassword: (dto: ResetPasswordDto) =>
    apiClient.post(ENDPOINTS.auth.resetPassword, dto).then((r) => r.data),
};
