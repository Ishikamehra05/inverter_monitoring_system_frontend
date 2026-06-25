import { apiClient } from "./apiClient";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  VerificationCodeRequest,
  ChangePasswordRequest
} from "./schemas/auth";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient<ApiEnvelope<LoginResponse>>("/auth/login", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  logout: () =>
    apiClient<ApiEnvelope<null>>("/auth/logout", {
      method: "POST",
      body: {},
    }),

  register: (payload: RegisterRequest) =>
    apiClient<ApiEnvelope<{ userId: string }>>("/auth/register", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  sendVerificationCode: (payload: VerificationCodeRequest) =>
    apiClient<ApiEnvelope<null>>("/auth/verification-code", {
      method: "POST",
      body: payload,
    }),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient<ApiEnvelope<null>>("/auth/forgot-password", {
      method: "POST",
      body: payload,
    }),

  changePassword: (payload: ChangePasswordRequest) =>
    apiClient<ApiEnvelope<null>>("/auth/changePassword", {
      method: "POST",
      body: payload,
    }),
};
