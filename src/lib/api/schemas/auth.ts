import { z } from "zod";

export const loginRequestSchema = z.object({
  portal: z.enum(["monitoring", "service"]),
  account: z.string().min(1),
  password: z.string().min(1),
  remember: z.boolean(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().optional(),
  redirect: z.string().optional(),

  requiresVerification: z.boolean().optional(),

  /*
   * Returned after successful username/password
   * authentication.
   */
  requiresTwoFactorChoice: z.boolean().optional(),

  /*
   * Common challenge ID used for the complete
   * Google Authenticator flow.
   */
  challengeId: z.string().optional(),

  /*
   * Tells frontend whether Google Authenticator
   * is currently enabled.
   *
   * IMPORTANT:
   *
   * This value is only used for the YES flow.
   * The NO flow must not depend on this value.
   */
  twoFactorEnabled: z.boolean().optional(),

  /*
   * Legacy fields kept for backward compatibility.
   */
  requiresTwoFactor: z.boolean().optional(),
  requiresTwoFactorSetup: z.boolean().optional(),

  verificationId: z.string().optional(),

  twoFactorChallengeId: z.string().optional(),

  twoFactorSetupChallengeId: z.string().optional(),

  email: z.string().optional(),

  user: z
    .object({
      id: z.string().optional(),
      userId: z.string().optional(),
      account: z.string(),
      email: z.string().optional(),
      role: z.string(),
      portal: z.enum(["monitoring", "service"]),
    })
    .optional(),
});

export const loginVerificationRequestSchema = z.object({
  verificationId: z.string().min(1),
  code: z.string().min(1),
});

export const twoFactorSetupRequestSchema = z.object({
  challengeId: z.string().min(1),
});

export const twoFactorSetupResponseSchema = z.object({
  challengeId: z.string(),
  secret: z.string(),
  otpauthUrl: z.string(),
});

/*
 * Google Authenticator verification.
 *
 * AUTHENTICATOR:
 *
 * setup = true
 *     Used immediately after a fresh Google
 *     Authenticator setup.
 *
 * setup = false/undefined
 *     Used when Google Authenticator is already
 *     enabled for the account.
 *
 * RECOVERY:
 *
 * Kept for backend/legacy recovery support.
 */
export const twoFactorVerifyRequestSchema =
  z.discriminatedUnion("method", [
    z.object({
      challengeId: z.string().min(1),

      method: z.literal("authenticator"),

      code: z
        .string()
        .regex(
          /^\d{6}$/,
          "Verification code must be 6 digits",
        ),

      /*
       * true:
       * Verify the first code after fresh setup
       * and enable Google Authenticator.
       *
       * false/undefined:
       * Verify an already-enabled authenticator.
       */
      setup: z.boolean().optional(),
    }),

    z.object({
      challengeId: z.string().min(1),

      method: z.literal("recovery"),

      code: z
        .string()
        .min(
          1,
          "Recovery code is required",
        )
        .max(32),
    }),
  ]);

/*
 * Legacy 2FA login verification request.
 *
 * Kept so existing code using the old
 * /auth/2fa/login-verify endpoint does not break.
 */
export const twoFactorLoginVerifyRequestSchema =
  z.object({
    challengeId: z.string().min(1),

    code: z
      .string()
      .regex(
        /^\d{6}$/,
        "Verification code must be 6 digits",
      ),
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
  account: z.string().min(
    1,
    "Account is required",
  ),

  verificationCode: z.string().min(
    1,
    "Verification code is required",
  ),

  newPassword: z.string().min(
    1,
    "New password is required",
  ),

  confirmPassword: z.string().min(
    1,
    "Confirm password is required",
  ),
});

export const ChangePasswordRequest = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

export type ChangePasswordRequest = z.infer<
  typeof ChangePasswordRequest
>;

export type LoginRequest = z.infer<
  typeof loginRequestSchema
>;

export type LoginResponse = z.infer<
  typeof loginResponseSchema
>;

export type LoginVerificationRequest = z.infer<
  typeof loginVerificationRequestSchema
>;

export type TwoFactorSetupRequest = z.infer<
  typeof twoFactorSetupRequestSchema
>;

export type TwoFactorSetupResponse = z.infer<
  typeof twoFactorSetupResponseSchema
>;

export type TwoFactorVerifyRequest = z.infer<
  typeof twoFactorVerifyRequestSchema
>;

export type TwoFactorLoginVerifyRequest = z.infer<
  typeof twoFactorLoginVerifyRequestSchema
>;

export type RegisterRequest = z.infer<
  typeof registerRequestSchema
>;

export type VerificationCodeRequest = z.infer<
  typeof verificationCodeRequestSchema
>;

export type ForgotPasswordRequest = z.infer<
  typeof forgotPasswordRequestSchema
>;