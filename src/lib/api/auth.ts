import { apiClient } from "./apiClient";

import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  VerificationCodeRequest,
  ChangePasswordRequest,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorLoginVerifyRequest,
} from "./schemas/auth";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type AuthenticatedUser = {
  userId: string;
  account: string;
  portal: "monitoring" | "service";
  role: string;
};

export type TwoFactorVerifyResponse = {
  requiresVerification?: boolean;
  requiresTwoFactor?: boolean;
  requiresTwoFactorSetup?: boolean;

  accessToken?: string;
  refreshToken?: string;

  user?: AuthenticatedUser;

  redirect?: string;

  recoveryCodes?: string[];

  recoveryVerified?: boolean;

  challengeId?: string;
};

export const authApi = {
  /*
   * LOGIN
   *
   * Username/password authentication.
   *
   * New backend response can contain:
   *
   * requiresTwoFactorChoice
   * challengeId
   * twoFactorEnabled
   */
  login: (payload: LoginRequest) =>
    apiClient<ApiEnvelope<LoginResponse>>(
      "/auth/login",
      {
        method: "POST",
        body: payload,
      },
    ).then((res) => res.data),

  /*
   * Generate/reset Google Authenticator setup.
   *
   * Used for:
   *
   * NO
   * OR
   * YES + 2FA disabled
   */
  setupTwoFactor: (
    payload: TwoFactorSetupRequest,
  ) =>
    apiClient<
      ApiEnvelope<TwoFactorSetupResponse>
    >("/auth/2fa/setup", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  /*
   * Google Authenticator verification.
   *
   * setup: true
   * ----------------
   * Used after a fresh Google Authenticator
   * setup.
   *
   * Backend verifies the first 6-digit code,
   * enables 2FA, and completes login.
   *
   * setup: false / undefined
   * ----------------
   * Used when Google Authenticator is already
   * enabled.
   *
   * Endpoint:
   *
   * POST /auth/2fa/verify
   */
  verifyTwoFactor: (
    payload: TwoFactorVerifyRequest,
  ) =>
    apiClient<
      ApiEnvelope<TwoFactorVerifyResponse>
    >("/auth/2fa/verify", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  /*
   * Legacy login verification endpoint.
   *
   * Kept for backward compatibility.
   */
  verifyTwoFactorLogin: (
    payload: TwoFactorLoginVerifyRequest,
  ) =>
    apiClient<
      ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
        user: AuthenticatedUser;
        redirect: string;
      }>
    >("/auth/2fa/login-verify", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  logout: () =>
    apiClient<ApiEnvelope<null>>(
      "/auth/logout",
      {
        method: "POST",
        body: {},
      },
    ),

  register: (
    payload: RegisterRequest,
  ) =>
    apiClient<
      ApiEnvelope<{ userId: string }>
    >("/auth/register", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  sendVerificationCode: (
    payload: VerificationCodeRequest,
  ) =>
    apiClient<ApiEnvelope<null>>(
      "/auth/verification-code",
      {
        method: "POST",
        body: payload,
      },
    ),

  forgotPassword: (
    payload: ForgotPasswordRequest,
  ) =>
    apiClient<ApiEnvelope<null>>(
      "/auth/forgetpassword",
      {
        method: "POST",
        body: payload,
      },
    ),

  changePassword: (
    payload: ChangePasswordRequest,
  ) =>
    apiClient<ApiEnvelope<null>>(
      "/auth/changePassword",
      {
        method: "POST",
        body: payload,
      },
    ),
};