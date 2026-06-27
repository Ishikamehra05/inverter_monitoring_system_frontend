import { z } from "zod";

export const loginRequestSchema = z.object({
  portal: z.enum(["monitoring", "service"]),
  account: z.string().min(1),
  password: z.string().min(1),
  remember: z.boolean(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().optional(),
  redirect: z.string(),
  user: z.object({
    id: z.string(),
    account: z.string(),
    email: z.string().optional(),
    role: z.string(),
    portal: z.enum(["monitoring", "service"]),
  }),
});

export const registerRequestSchema = z.object({
  account: z.string().min(1),
  password: z.string().min(1),
  confirmPassword: z.string().min(1),
  email: z.string().email(),
  timezone: z.string(),
  verificationCode: z.string().min(1),
});

export const verificationCodeRequestSchema = z.object({
  account: z.string().min(1),
  email: z.string().email(),
  purpose: z.literal("registration"),
});

export const forgotPasswordRequestSchema = z.object({
  account: z.string().min(1, "Account is required"),
  newPassword: z.string().min(1, "New password is required"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});

export const ChangePasswordRequest = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequest>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type VerificationCodeRequest = z.infer<
  typeof verificationCodeRequestSchema
>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
