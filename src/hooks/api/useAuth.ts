"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api/auth";

import { clearAuthSession, setAuthSession } from "@/lib/auth/session";

import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  TwoFactorSetupRequest,
  TwoFactorVerifyRequest,
  VerificationCodeRequest,
} from "@/lib/api/schemas/auth";

import { UserRole } from "@/types/auth";

/*
 * LOGIN
 *
 * New flow:
 * - 2FA disabled: backend returns tokens immediately.
 * - 2FA enabled: backend returns requiresTwoFactor + challengeId.
 */
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),

    onSuccess: (data) => {
      // Password-only login is complete when backend returns tokens.
      if (data.accessToken && data.refreshToken && data.user) {
        const userId = data.user.userId ?? data.user.id;

        if (!userId) {
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

        router.push(data.redirect ?? getDefaultRoute(data.user.portal));
      }
      // When requiresTwoFactor=true, LoginForm displays the OTP screen.
    },
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
    mutationFn: (payload: TwoFactorSetupRequest) =>
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
    mutationFn: (payload: TwoFactorVerifyRequest) =>
      authApi.verifyTwoFactor(payload),

    onSuccess: (data) => {
      /*
       * Backend must return the complete
       * authentication session after a
       * successful 2FA verification.
       */
      if (!data.accessToken || !data.refreshToken || !data.user) {
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

      router.push(data.redirect ?? getDefaultRoute(data.user.portal));
    },
  });
};

function getDefaultRoute(portal: "monitoring" | "service") {
  return portal === "service" ? "/services" : "/monitor";
}

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
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
  });

/*
 * SEND VERIFICATION CODE
 */
export const useSendVerificationCode = () =>
  useMutation({
    mutationFn: (payload: VerificationCodeRequest) =>
      authApi.sendVerificationCode(payload),
  });

/*
 * FORGOT PASSWORD
 */
export const useForgotPassword = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordRequest) =>
      authApi.forgotPassword(payload),
  });

/*
 * CHANGE PASSWORD
 */
export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      authApi.changePassword(payload),
  });
