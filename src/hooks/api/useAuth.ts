"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { isBackendUnavailable } from "@/lib/api/errors";
import { clearAuthSession, setAuthSession } from "@/lib/auth/session";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  VerificationCodeRequest,
  ChangePasswordRequest,
} from "@/lib/api/schemas/auth";
import { UserRole } from "@/types/auth";

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      try {
        return await authApi.login(payload);
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;
        if (
          payload.portal === "monitoring" &&
          payload.account === "PMPLASTIC" &&
          payload.password === "polycab123"
        ) {
          return {
            accessToken: "dev-monitoring-token",
            redirect: "/monitor/plants",
            user: {
              id: "dev_monitoring",
              account: payload.account,
              role: "monitoring_user",
              portal: "monitoring" as const,
            },
          };
        }
        if (
          payload.portal === "service" &&
          payload.account === "service" &&
          payload.password === "service123"
        ) {
          return {
            accessToken: "dev-service-token",
            redirect: "/services/monitor/list",
            user: {
              id: "dev_service",
              account: payload.account,
              role: "service_admin",
              portal: "service" as const,
            },
          };
        }
        throw new Error(
          payload.portal === "monitoring"
            ? "Invalid Monitoring credentials."
            : "Invalid Service credentials.",
        );
      }
    },
    onSuccess: (data, variables) => {
      if (variables.remember) {
        localStorage.setItem(
          "rememberedLogin",
          JSON.stringify({
            account: variables.account,
            password: variables.password,
            portal: variables.portal,
          }),
        );
      } else {
        localStorage.removeItem("rememberedLogin");
      }

      setAuthSession(
        data.accessToken,
        data.refreshToken!,
        data.user.portal,
        data.user.account || variables.account,
        data.user.role as UserRole,
      );
      queryClient.clear();
      router.push(data.redirect);
    },
  });
};

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;
      }
    },
    onSettled: () => {
      clearAuthSession();
      router.push("/login");
    },
  });
};

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
  });

export const useSendVerificationCode = () =>
  useMutation({
    mutationFn: (payload: VerificationCodeRequest) =>
      authApi.sendVerificationCode(payload),
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordRequest) =>
      authApi.forgotPassword(payload),
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      authApi.changePassword(payload),
  });
