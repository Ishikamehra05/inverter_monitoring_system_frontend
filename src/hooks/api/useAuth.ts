"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api/auth";

import {
  clearAuthSession,
  setAuthSession,
} from "@/lib/auth/session";

import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  TwoFactorLoginVerifyRequest,
  TwoFactorSetupRequest,
  TwoFactorVerifyRequest,
  VerificationCodeRequest,
} from "@/lib/api/schemas/auth";

import { UserRole } from "@/types/auth";

/*
 * LOGIN
 *
 * Username/password authentication only.
 *
 * The backend returns the 2FA choice
 * information instead of issuing JWT immediately.
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginRequest) =>
      authApi.login(payload),
  });
};

/*
 * Generate/reset Google Authenticator setup.
 *
 * Used when:
 *
 * NO
 *
 * OR
 *
 * YES + 2FA disabled
 */
export const useSetupTwoFactor = () => {
  return useMutation({
    mutationFn: (
      payload: TwoFactorSetupRequest,
    ) =>
      authApi.setupTwoFactor(payload),
  });
};

/*
 * GOOGLE AUTHENTICATOR VERIFICATION
 *
 * This single hook handles BOTH cases:
 *
 * 1. Existing enabled 2FA:
 *
 *    setup is omitted
 *
 * 2. Fresh 2FA setup:
 *
 *    setup: true
 *
 * In both cases the request goes to:
 *
 * POST /auth/2fa/verify
 */
export const useVerifyTwoFactor = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: TwoFactorVerifyRequest,
    ) =>
      authApi.verifyTwoFactor(payload),

    onSuccess: (data) => {
      /*
       * Backend must return the complete
       * authentication session after a
       * successful 2FA verification.
       */
      if (
        !data.accessToken ||
        !data.refreshToken ||
        !data.user ||
        !data.redirect
      ) {
        return;
      }

      setAuthSession(
        data.accessToken,
        data.refreshToken,
        data.user.portal,
        data.user.account,
        data.user.role as UserRole,
      );

      queryClient.clear();

      router.push(data.redirect);
    },
  });
};

/*
 * LEGACY 2FA LOGIN VERIFICATION
 *
 * Kept so existing code/endpoints do not break.
 */
export const useVerifyTwoFactorLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: TwoFactorLoginVerifyRequest,
    ) =>
      authApi.verifyTwoFactorLogin(payload),

    onSuccess: (data) => {
      if (
        !data.accessToken ||
        !data.refreshToken ||
        !data.user ||
        !data.redirect
      ) {
        return;
      }

      setAuthSession(
        data.accessToken,
        data.refreshToken,
        data.user.portal,
        data.user.account,
        data.user.role as UserRole,
      );

      queryClient.clear();

      router.push(data.redirect);
    },
  });
};

/*
 * LOGOUT
 */
export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        clearAuthSession();
      }
    },

    onSettled: () => {
      clearAuthSession();

      router.push("/login");
    },
  });
};

/*
 * REGISTER
 */
export const useRegister = () =>
  useMutation({
    mutationFn: (
      payload: RegisterRequest,
    ) =>
      authApi.register(payload),
  });

/*
 * SEND VERIFICATION CODE
 */
export const useSendVerificationCode = () =>
  useMutation({
    mutationFn: (
      payload: VerificationCodeRequest,
    ) =>
      authApi.sendVerificationCode(payload),
  });

/*
 * FORGOT PASSWORD
 */
export const useForgotPassword = () =>
  useMutation({
    mutationFn: (
      payload: ForgotPasswordRequest,
    ) =>
      authApi.forgotPassword(payload),
  });

/*
 * CHANGE PASSWORD
 */
export const useChangePassword = () =>
  useMutation({
    mutationFn: (
      payload: ChangePasswordRequest,
    ) =>
      authApi.changePassword(payload),
  });