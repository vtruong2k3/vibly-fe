import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type { AdminUser, TotpSetupResponse, TotpEnableResponse } from "@/types/admin.types";
import { adminTokenStorage } from "@/lib/api/admin-axios";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

// Step 1 response — no TOTP
interface LoginSuccessResponse {
  accessToken: string;
  admin: AdminUser;
}

// Step 1 response — TOTP required
interface LoginTotpRequiredResponse {
  requireTotp: true;
  tempToken: string;
}

export type AdminLoginResult =
  | (LoginSuccessResponse & { requireTotp?: false })
  | LoginTotpRequiredResponse;

// Step 2 response — after TOTP verify
interface TotpVerifyResult {
  accessToken: string;
  admin: AdminUser;
}

const adminAuthService = {
  /** Step 1: Login with email + password */
  login: async (dto: AdminLoginDto): Promise<AdminLoginResult> => {
    const { data } = await adminApiClient.post<ApiEnvelope<AdminLoginResult>>(
      ADMIN_ENDPOINTS.auth.login,
      dto,
    );
    return data.data;
  },

  /** Step 2: Complete login with TOTP code + tempToken from step 1 */
  verifyTotp: async (code: string, tempToken: string): Promise<TotpVerifyResult> => {
    const { data } = await adminApiClient.post<ApiEnvelope<TotpVerifyResult>>(
      ADMIN_ENDPOINTS.auth.totpVerify,
      { code, tempToken },
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await adminApiClient.post(ADMIN_ENDPOINTS.auth.logout);
    adminTokenStorage.clear();
  },

  // ── TOTP Setup (for already-authenticated admins) ─────────────────────────

  /** Initiate TOTP setup — returns QR code data URL to display */
  setupTotp: async (): Promise<TotpSetupResponse> => {
    const { data } = await adminApiClient.post<ApiEnvelope<TotpSetupResponse>>(
      ADMIN_ENDPOINTS.auth.totpSetup,
    );
    return data.data;
  },

  /** Confirm setup with first valid TOTP code — returns one-time backup codes */
  enableTotp: async (code: string): Promise<TotpEnableResponse> => {
    const { data } = await adminApiClient.post<ApiEnvelope<TotpEnableResponse>>(
      ADMIN_ENDPOINTS.auth.totpEnable,
      { code },
    );
    return data.data;
  },
};

export default adminAuthService;
