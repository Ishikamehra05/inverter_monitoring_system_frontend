"use client";

import { useState } from "react";
import Tabs from "./Tabs";
import Link from "next/link";
import { Eye, EyeOff, X, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import {
  useLogin,
  useSetupTwoFactor,
  useVerifyTwoFactor,
} from "@/hooks/api/useAuth";

type TabType = "Monitoring" | "Service";

interface LoginErrors {
  account?: string;
  password?: string;
  general?: string;
}

type TwoFactorMode =
  | "choice"
  | "not-enabled"
  | "setup"
  | "authenticator"
  | null;

type SetupChoice = "yes" | "no" | null;

const GOOGLE_AUTHENTICATOR_ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2";

const GOOGLE_AUTHENTICATOR_IOS_URL =
  "https://apps.apple.com/app/google-authenticator/id388497605";

export default function LoginForm() {
  const loginMutation = useLogin();

  const setupTwoFactorMutation =
    useSetupTwoFactor();

  const verifyTwoFactorMutation =
    useVerifyTwoFactor();

  const [activeTab, setActiveTab] =
    useState<TabType>("Monitoring");

  const [account, setAccount] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [remember, setRemember] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [twoFactorMode, setTwoFactorMode] =
    useState<TwoFactorMode>(null);

  const [setupChoice, setSetupChoice] =
    useState<SetupChoice>(null);

  const [twoFactorChallengeId, setTwoFactorChallengeId] =
    useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] =
    useState(false);

  const [twoFactorCode, setTwoFactorCode] =
    useState("");

  const [twoFactorSecret, setTwoFactorSecret] =
    useState("");

  const [twoFactorOtpAuthUrl, setTwoFactorOtpAuthUrl] =
    useState("");

  const [twoFactorSetupComplete, setTwoFactorSetupComplete] =
    useState(false);

  const [twoFactorError, setTwoFactorError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [errors, setErrors] =
    useState<LoginErrors>({});

  /*
   * Validate username and password.
   */
  const validateFields = (
    accountValue: string,
    passwordValue: string,
  ) => {
    const newErrors: LoginErrors = {};

    if (!accountValue.trim()) {
      newErrors.account =
        "Account is required.";
    }

    if (!passwordValue.trim()) {
      newErrors.password =
        "Password is required.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /*
   * Reset frontend 2FA state.
   *
   * This does NOT change anything in backend.
   */
  const resetTwoFactorState = () => {
    setTwoFactorCode("");
    setTwoFactorSecret("");
    setTwoFactorOtpAuthUrl("");
    setTwoFactorError("");
    setSetupChoice(null);
    setTwoFactorSetupComplete(false);
    setCopied(false);
  };

  /*
   * LOGIN
   *
   * Username/password is checked first.
   *
   * Backend then returns:
   *
   * requiresTwoFactorChoice
   * challengeId
   * twoFactorEnabled
   */
  const handleLogin = async (
    accountValue: string,
    passwordValue: string,
  ) => {
    setErrors({});

    if (
      !validateFields(
        accountValue,
        passwordValue,
      )
    ) {
      return;
    }

    try {
      const response =
        await loginMutation.mutateAsync({
          portal:
            activeTab === "Monitoring"
              ? "monitoring"
              : "service",
          account: accountValue,
          password: passwordValue,
          remember,
        });

      /*
       * NEW LOGIN FLOW
       */
      if (
        response.requiresTwoFactorChoice === true &&
        response.challengeId
      ) {
        setTwoFactorChallengeId(
          response.challengeId,
        );

        setTwoFactorEnabled(
          response.twoFactorEnabled === true,
        );

        resetTwoFactorState();

        setTwoFactorMode("choice");

        return;
      }

      /*
       * Backward compatibility.
       *
       * If backend directly returns accessToken,
       * useLogin() handles successful login.
       */
      if (response.accessToken) {
        return;
      }

      /*
       * Do NOT show the old:
       *
       * "Two-factor authentication is required
       * before login."
       */
      setErrors({
        general:
          "Unable to continue login. Please try again.",
      });
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      });
    }
  };

  /*
   * USER SELECTS YES
   *
   * YES:
   * - check existing enabled state
   * - enabled=true  -> ask for 6 digit code
   * - enabled=false -> show enable message
   */
  const handleChooseYes = () => {
    setSetupChoice("yes");
    setTwoFactorCode("");
    setTwoFactorError("");

    if (twoFactorEnabled) {
      setTwoFactorMode("authenticator");
      return;
    }

    setTwoFactorMode("not-enabled");
  };

  /*
   * USER SELECTS NO
   *
   * IMPORTANT:
   *
   * We DO NOT check twoFactorEnabled here.
   *
   * We directly call /auth/2fa/setup.
   *
   * Backend createOrResetTwoFactor():
   * - generates fresh secret
   * - replaces old secret
   * - sets enabled=false
   */
  const handleChooseNo = async () => {
    setSetupChoice("no");
    setTwoFactorMode("setup");
    setTwoFactorCode("");
    setTwoFactorError("");
    setTwoFactorSetupComplete(false);

    await handleSetupTwoFactor();
  };

  /*
   * GENERATE / RESET SETUP
   *
   * Existing endpoint:
   *
   * POST /auth/2fa/setup
   */
  const handleSetupTwoFactor = async () => {
    if (!twoFactorChallengeId) {
      setTwoFactorError(
        "Two-factor setup challenge is missing.",
      );

      return;
    }

    try {
      setTwoFactorError("");

      const response =
        await setupTwoFactorMutation.mutateAsync({
          challengeId:
            twoFactorChallengeId,
        });

      setTwoFactorSecret(
        response.secret,
      );

      setTwoFactorOtpAuthUrl(
        response.otpauthUrl,
      );

      /*
       * Backend can return a new challengeId.
       * If it doesn't, keep the existing one.
       */
      if (response.challengeId) {
        setTwoFactorChallengeId(
          response.challengeId,
        );
      }

      setTwoFactorSetupComplete(true);
    } catch (error) {
      setTwoFactorError(
        error instanceof Error
          ? error.message
          : "Unable to setup Google Authenticator.",
      );
    }
  };

  /*
   * EXISTING ENABLED 2FA
   *
   * YES + enabled=true
   *
   * Existing endpoint:
   *
   * POST /auth/2fa/verify
   */
  const handleTwoFactorVerification =
    async () => {
      if (!twoFactorChallengeId) {
        setTwoFactorError(
          "Two-factor authentication challenge is missing.",
        );

        return;
      }

      if (!/^\d{6}$/.test(twoFactorCode)) {
        setTwoFactorError(
          "Enter the 6-digit code from Google Authenticator.",
        );

        return;
      }

      try {
        setTwoFactorError("");

        await verifyTwoFactorMutation.mutateAsync(
          {
            challengeId:
              twoFactorChallengeId,
            method: "authenticator",
            code: twoFactorCode,
          },
        );

        /*
         * useVerifyTwoFactor() handles:
         * - auth session
         * - token storage
         * - query cache
         * - redirect
         */
      } catch (error) {
        setTwoFactorError(
          error instanceof Error
            ? error.message
            : "Invalid Google Authenticator code.",
        );

        setTwoFactorCode("");
      }
    };

  /*
   * NEW SETUP VERIFICATION
   *
   * IMPORTANT:
   *
   * NO /auth/2fa/setup/verify
   *
   * We use the EXISTING:
   *
   * POST /auth/2fa/verify
   *
   * with:
   *
   * method: "authenticator"
   * setup: true
   *
   * Backend must treat setup=true as:
   *
   * 1. Verify generated TOTP
   * 2. Enable 2FA
   * 3. Consume challenge
   * 4. Issue login tokens
   */
  const handleTwoFactorSetupVerification =
    async () => {
      if (!twoFactorChallengeId) {
        setTwoFactorError(
          "Two-factor setup challenge is missing.",
        );

        return;
      }

      if (!/^\d{6}$/.test(twoFactorCode)) {
        setTwoFactorError(
          "Enter the 6-digit code from Google Authenticator.",
        );

        return;
      }

      try {
        setTwoFactorError("");

        await verifyTwoFactorMutation.mutateAsync(
          {
            challengeId:
              twoFactorChallengeId,
            method: "authenticator",
            code: twoFactorCode,
            setup: true,
          },
        );

        /*
         * Existing useVerifyTwoFactor() handles:
         * - auth session
         * - token storage
         * - query cache
         * - redirect
         */
      } catch (error) {
        setTwoFactorError(
          error instanceof Error
            ? error.message
            : "Invalid Google Authenticator code.",
        );

        setTwoFactorCode("");
      }
    };

  /*
   * COPY MANUAL SECRET
   */
  const handleCopySecret = async () => {
    if (!twoFactorSecret) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        twoFactorSecret,
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setTwoFactorError(
        "Unable to copy the secret. Please copy it manually.",
      );
    }
  };

  /*
   * CLOSE MODAL
   */
  const closeTwoFactorModal = () => {
    if (
      setupTwoFactorMutation.isPending ||
      verifyTwoFactorMutation.isPending
    ) {
      return;
    }

    setTwoFactorMode(null);
    setTwoFactorChallengeId("");
    setTwoFactorEnabled(false);

    resetTwoFactorState();
  };

  const isTwoFactorPending =
    setupTwoFactorMutation.isPending ||
    verifyTwoFactorMutation.isPending;

  return (
    <div className="w-full max-w-sm">
      <Tabs
        active={activeTab}
        onChange={setActiveTab}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (loginMutation.isPending) {
            return;
          }

          const form =
            new FormData(e.currentTarget);

          const accountValue = String(
            form.get("account") ?? account,
          );

          const passwordValue = String(
            form.get("password") ?? password,
          );

          setAccount(accountValue);
          setPassword(passwordValue);

          handleLogin(
            accountValue,
            passwordValue,
          );
        }}
        className="space-y-6"
      >
        {/* Account */}
        <div className="flex flex-col">
          <span className="flex items-start gap-2">
            <label className="text-red-500">
              *
            </label>

            <label className="label">
              Account
            </label>
          </span>

          <input
            name="account"
            autoComplete="username"
            value={account}
            onChange={(e) =>
              setAccount(e.target.value)
            }
            placeholder="Enter Username"
            className={`shadow-md w-full rounded-sm p-1.5 border outline-none transition
              focus:border-blue-500 text-sm
              ${
                errors.account
                  ? "border-red-500"
                  : "border-gray-300"
              }
            `}
          />

          {errors.account && (
            <p className="text-red-500 text-xs mt-1">
              {errors.account}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <span className="flex items-start gap-2">
            <label className="text-red-500">
              *
            </label>

            <label className="label">
              Password
            </label>
          </span>

          <div className="relative">
            <input
              name="password"
              autoComplete="current-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter Password"
              className={`shadow-md w-full rounded-sm p-1.5 pr-10 border outline-none transition
                focus:border-blue-500 text-sm
                ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }
              `}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword,
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <p className="text-red-500 text-sm text-center">
            {errors.general}
          </p>
        )}

        {/* Remember + Forgot */}
        <div className="flex justify-between text-sm">
          <label className="flex gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={() =>
                setRemember(!remember)
              }
            />

            Remember
          </label>

          {activeTab !== "Service" && (
            <Link
              href="/forgot-password"
              className="text-blue-600"
            >
              Forgot your password?
            </Link>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="bg-blue-500 text-white py-2 rounded-md disabled:opacity-50"
          >
            {loginMutation.isPending
              ? "Checking..."
              : "Login"}
          </button>

          {activeTab !== "Service" && (
            <Link
              href="/register"
              className="bg-white text-black text-center border py-2 rounded-md"
            >
              Register
            </Link>
          )}
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          V1.1.1.a
        </p>
      </form>

      {/* =====================================================
          GOOGLE AUTHENTICATOR MODAL
          ===================================================== */}

      {twoFactorMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Google Authenticator
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Complete the authentication
                  setup to continue.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeTwoFactorModal
                }
                disabled={isTwoFactorPending}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">

              {/* =================================================
                  YES / NO
                  ================================================= */}

              {twoFactorMode === "choice" &&
                setupChoice === null && (
                  <div className="space-y-5">
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm font-medium text-gray-900">
                        Have you already set up
                        Google Authenticator?
                      </p>

                      <p className="text-sm text-gray-600 mt-2">
                        Choose Yes if Google
                        Authenticator is already
                        configured for this account.
                      </p>

                      <p className="text-sm text-gray-600 mt-2">
                        Choose No if you want to
                        create a fresh Google
                        Authenticator setup.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={
                          handleChooseYes
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-800 hover:bg-gray-50"
                      >
                        Yes
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleChooseNo
                        }
                        disabled={
                          isTwoFactorPending
                        }
                        className="w-full rounded-md bg-blue-500 px-4 py-2.5 text-white hover:bg-blue-600 disabled:opacity-50"
                      >
                        {setupTwoFactorMutation.isPending
                          ? "Setting up..."
                          : "No"}
                      </button>
                    </div>
                  </div>
                )}

              {/* =================================================
                  YES + NOT ENABLED
                  ================================================= */}

              {twoFactorMode ===
                "not-enabled" && (
                  <div className="space-y-5">
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                      <p className="text-sm font-medium text-gray-900">
                        Google Authenticator is
                        not enabled
                      </p>

                      <p className="text-sm text-gray-700 mt-2">
                        Google Authenticator is not
                        enabled for this account.
                        Please enable it first.
                      </p>

                      <p className="text-sm text-gray-600 mt-2">
                        We will generate a fresh
                        setup QR code for your
                        account.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleChooseNo
                      }
                      disabled={
                        isTwoFactorPending
                      }
                      className="w-full rounded-md bg-blue-500 px-4 py-2.5 text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      {setupTwoFactorMutation.isPending
                        ? "Setting up..."
                        : "Enable Google Authenticator"}
                    </button>

                    {twoFactorError && (
                      <p className="text-sm text-red-500">
                        {twoFactorError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSetupChoice(null);
                        setTwoFactorMode(
                          "choice",
                        );
                        setTwoFactorError("");
                      }}
                      disabled={
                        isTwoFactorPending
                      }
                      className="w-full text-sm text-gray-500 hover:text-gray-700"
                    >
                      Back
                    </button>
                  </div>
                )}

              {/* =================================================
                  YES + ENABLED
                  ================================================= */}

              {twoFactorMode ===
                "authenticator" &&
                setupChoice === "yes" && (
                  <div className="space-y-5">
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm font-medium text-gray-900">
                        Verify Google Authenticator
                      </p>

                      <p className="text-sm text-gray-700 mt-2">
                        Enter the current 6-digit
                        code from your Google
                        Authenticator app.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Authenticator code
                      </label>

                      <input
                        value={twoFactorCode}
                        onChange={(e) => {
                          const value =
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);

                          setTwoFactorCode(value);
                          setTwoFactorError("");
                        }}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        autoFocus
                        placeholder="000000"
                        className="w-full rounded-md border border-gray-300 p-3 text-center text-xl tracking-[0.5em] font-mono outline-none focus:border-blue-500"
                      />
                    </div>

                    {twoFactorError && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-500">
                          {twoFactorError}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleTwoFactorVerification
                      }
                      disabled={
                        verifyTwoFactorMutation.isPending ||
                        twoFactorCode.length !== 6
                      }
                      className="w-full rounded-md bg-blue-500 px-4 py-2.5 text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      {verifyTwoFactorMutation.isPending
                        ? "Verifying..."
                        : "Verify & Login"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSetupChoice(null);
                        setTwoFactorMode(
                          "choice",
                        );
                        setTwoFactorCode("");
                        setTwoFactorError("");
                      }}
                      disabled={
                        isTwoFactorPending
                      }
                      className="w-full text-sm text-gray-500 hover:text-gray-700"
                    >
                      Back
                    </button>
                  </div>
                )}

              {/* =================================================
                  NO → SETUP
                  ================================================= */}

              {twoFactorMode === "setup" &&
                setupChoice === "no" && (
                  <div className="space-y-5">

                    {/* SETUP ERROR */}
                    {twoFactorError &&
                      !twoFactorSetupComplete && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4">
                          <p className="text-sm text-red-500">
                            {twoFactorError}
                          </p>
                        </div>
                      )}

                    {/* BEFORE SETUP */}
                    {!twoFactorSetupComplete && (
                      <div className="space-y-4">
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                          <p className="text-sm font-medium text-gray-900">
                            Set up Google Authenticator
                          </p>

                          <p className="text-sm text-gray-700 mt-2">
                            Install Google Authenticator
                            on your mobile phone.
                          </p>
                        </div>

                        {/* APP DOWNLOAD */}
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm font-medium text-gray-900">
                            Step 1 — Install the app
                          </p>

                          <div className="grid grid-cols-2 gap-3 mt-4">

                            {/* Android */}
                            <div className="rounded-md border border-gray-200 bg-white p-3 text-center">
                              <p className="text-sm font-medium text-gray-900 mb-3">
                                Android
                              </p>

                              <div className="flex justify-center">
                                <div className="rounded-md border border-gray-200 bg-white p-2">
                                  <QRCodeSVG
                                    value={
                                      GOOGLE_AUTHENTICATOR_ANDROID_URL
                                    }
                                    size={120}
                                    level="M"
                                  />
                                </div>
                              </div>

                              <a
                                href={
                                  GOOGLE_AUTHENTICATOR_ANDROID_URL
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-3 text-xs font-medium text-blue-600 hover:underline"
                              >
                                Open Google Play
                              </a>
                            </div>

                            {/* iPhone */}
                            <div className="rounded-md border border-gray-200 bg-white p-3 text-center">
                              <p className="text-sm font-medium text-gray-900 mb-3">
                                iPhone
                              </p>

                              <div className="flex justify-center">
                                <div className="rounded-md border border-gray-200 bg-white p-2">
                                  <QRCodeSVG
                                    value={
                                      GOOGLE_AUTHENTICATOR_IOS_URL
                                    }
                                    size={120}
                                    level="M"
                                  />
                                </div>
                              </div>

                              <a
                                href={
                                  GOOGLE_AUTHENTICATOR_IOS_URL
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-3 text-xs font-medium text-blue-600 hover:underline"
                              >
                                Open App Store
                              </a>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={
                            handleSetupTwoFactor
                          }
                          disabled={
                            setupTwoFactorMutation.isPending
                          }
                          className="w-full rounded-md bg-blue-500 px-4 py-2.5 text-white disabled:opacity-50"
                        >
                          {setupTwoFactorMutation.isPending
                            ? "Generating..."
                            : "Generate Setup"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSetupChoice(null);
                            setTwoFactorMode(
                              "choice",
                            );
                            setTwoFactorError("");
                          }}
                          disabled={
                            isTwoFactorPending
                          }
                          className="w-full text-sm text-gray-500 hover:text-gray-700"
                        >
                          Back
                        </button>
                      </div>
                    )}

                    {/* AFTER SETUP GENERATION */}
                    {twoFactorSetupComplete &&
                      twoFactorSecret && (
                        <div className="space-y-4">

                          {/* STEP 1 */}
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                            <p className="text-sm font-medium text-gray-900">
                              Step 1 — Install Google
                              Authenticator
                            </p>

                            <p className="text-xs text-gray-600 mt-1">
                              If you already have the
                              app installed, continue
                              to the next step.
                            </p>

                            <div className="grid grid-cols-2 gap-3 mt-4">

                              {/* Android */}
                              <div className="rounded-md border border-gray-200 bg-white p-3 text-center">
                                <p className="text-sm font-medium text-gray-900 mb-3">
                                  Android
                                </p>

                                <div className="flex justify-center">
                                  <div className="rounded-md border border-gray-200 bg-white p-2">
                                    <QRCodeSVG
                                      value={
                                        GOOGLE_AUTHENTICATOR_ANDROID_URL
                                      }
                                      size={100}
                                      level="M"
                                    />
                                  </div>
                                </div>

                                <a
                                  href={
                                    GOOGLE_AUTHENTICATOR_ANDROID_URL
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block mt-2 text-xs font-medium text-blue-600 hover:underline"
                                >
                                  Open Google Play
                                </a>
                              </div>

                              {/* iPhone */}
                              <div className="rounded-md border border-gray-200 bg-white p-3 text-center">
                                <p className="text-sm font-medium text-gray-900 mb-3">
                                  iPhone
                                </p>

                                <div className="flex justify-center">
                                  <div className="rounded-md border border-gray-200 bg-white p-2">
                                    <QRCodeSVG
                                      value={
                                        GOOGLE_AUTHENTICATOR_IOS_URL
                                      }
                                      size={100}
                                      level="M"
                                    />
                                  </div>
                                </div>

                                <a
                                  href={
                                    GOOGLE_AUTHENTICATOR_IOS_URL
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block mt-2 text-xs font-medium text-blue-600 hover:underline"
                                >
                                  Open App Store
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* STEP 2 */}
                          {twoFactorOtpAuthUrl && (
                            <div className="rounded-md border border-gray-200 bg-white p-4">
                              <p className="text-sm font-medium text-gray-900 mb-3 text-center">
                                Step 2 — Scan setup QR
                                code
                              </p>

                              <div className="flex justify-center">
                                <div className="rounded-md border border-gray-200 bg-white p-3">
                                  <QRCodeSVG
                                    value={
                                      twoFactorOtpAuthUrl
                                    }
                                    size={220}
                                    level="M"
                                  />
                                </div>
                              </div>

                              <p className="text-xs text-gray-500 mt-3 text-center">
                                Open Google Authenticator
                                and scan this QR code to
                                add your Polycab account.
                              </p>
                            </div>
                          )}

                          {/* STEP 3 */}
                          <div className="rounded-md border border-gray-200 p-4">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              Step 3 — Manual setup key
                            </p>

                            <div className="flex items-center gap-2">
                              <input
                                value={
                                  twoFactorSecret
                                }
                                readOnly
                                className="w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-sm font-mono tracking-wider text-gray-800"
                              />

                              <button
                                type="button"
                                onClick={
                                  handleCopySecret
                                }
                                className="shrink-0 rounded-md border border-gray-300 p-2.5 text-gray-600 hover:bg-gray-100"
                                title="Copy secret"
                              >
                                {copied ? (
                                  <Check
                                    size={18}
                                  />
                                ) : (
                                  <Copy
                                    size={18}
                                  />
                                )}
                              </button>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                              If QR scanning is not
                              possible, enter this key
                              manually in Google
                              Authenticator.
                            </p>
                          </div>

                          {/* STEP 4 */}
                          <div className="rounded-md border border-gray-200 p-4">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              Step 4 — Enter verification
                              code
                            </p>

                            <input
                              value={
                                twoFactorCode
                              }
                              onChange={(e) => {
                                const value =
                                  e.target.value
                                    .replace(
                                      /\D/g,
                                      "",
                                    )
                                    .slice(
                                      0,
                                      6,
                                    );

                                setTwoFactorCode(
                                  value,
                                );

                                setTwoFactorError(
                                  "",
                                );
                              }}
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              autoFocus
                              placeholder="000000"
                              className="w-full rounded-md border border-gray-300 p-3 text-center text-xl tracking-[0.5em] font-mono outline-none focus:border-blue-500"
                            />
                          </div>

                          {twoFactorError && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4">
                              <p className="text-sm text-red-500">
                                {twoFactorError}
                              </p>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={
                              handleTwoFactorSetupVerification
                            }
                            disabled={
                              verifyTwoFactorMutation.isPending ||
                              twoFactorCode.length !==
                                6
                            }
                            className="w-full rounded-md bg-blue-500 px-4 py-2.5 text-white hover:bg-blue-600 disabled:opacity-50"
                          >
                            {verifyTwoFactorMutation.isPending
                              ? "Verifying..."
                              : "Verify & Login"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSetupChoice(null);
                              setTwoFactorMode(
                                "choice",
                              );
                              setTwoFactorSecret("");
                              setTwoFactorOtpAuthUrl("");
                              setTwoFactorSetupComplete(
                                false,
                              );
                              setTwoFactorCode("");
                              setTwoFactorError("");
                              setCopied(false);
                            }}
                            disabled={
                              isTwoFactorPending
                            }
                            className="w-full text-sm text-gray-500 hover:text-gray-700"
                          >
                            Back
                          </button>
                        </div>
                      )}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}