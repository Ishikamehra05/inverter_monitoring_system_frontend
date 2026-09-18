"use client";

import { useState } from "react";
import Tabs from "./Tabs";
import Link from "next/link";
import { Eye, EyeOff, X } from "lucide-react";

import { useLogin, useVerifyTwoFactor } from "@/hooks/api/useAuth";

type TabType = "Monitoring" | "Service";
type TwoFactorMethod = "authenticator" | "recovery";

interface LoginErrors {
  account?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  const loginMutation = useLogin();
  const verifyTwoFactorMutation = useVerifyTwoFactor();

  const [activeTab, setActiveTab] = useState<TabType>("Monitoring");

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login-only 2FA state. Recovery/setup are intentionally not part
  // of the normal login flow.
  const [twoFactorChallengeId, setTwoFactorChallengeId] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorMethod, setTwoFactorMethod] =
    useState<TwoFactorMethod>("authenticator");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const [errors, setErrors] = useState<LoginErrors>({});

  const validateFields = (accountValue: string, passwordValue: string) => {
    const newErrors: LoginErrors = {};

    if (!accountValue.trim()) {
      newErrors.account = "Account is required.";
    }

    if (!passwordValue.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetTwoFactorState = () => {
    setTwoFactorChallengeId("");
    setTwoFactorCode("");
    setTwoFactorMethod("authenticator");
    setTwoFactorError("");
    setShowTwoFactor(false);
  };

  /*
   * LOGIN
   *
   * 2FA OFF:
   * Account + Password -> backend returns tokens -> useLogin stores
   * the session and redirects.
   *
   * 2FA ON:
   * Account + Password -> backend returns requiresTwoFactor +
   * challengeId -> show 6-digit Authenticator screen.
   */
  const handleLogin = async (accountValue: string, passwordValue: string) => {
    setErrors({});
    setTwoFactorError("");

    if (!validateFields(accountValue, passwordValue)) {
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        portal: activeTab === "Monitoring" ? "monitoring" : "service",
        account: accountValue,
        password: passwordValue,
        remember,
      });

      const challengeId = response.twoFactorChallengeId ?? response.challengeId;

      if (response.requiresTwoFactor === true && challengeId) {
        setTwoFactorChallengeId(challengeId);
        setTwoFactorCode("");
        setTwoFactorError("");
        setShowTwoFactor(true);
        return;
      }

      // When 2FA is disabled, useLogin() handles the
      // returned access/refresh tokens and redirect.
      if (response.accessToken && response.refreshToken) {
        return;
      }

      setErrors({
        general: "Unable to continue login. Please try again.",
      });
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Invalid account or password.",
      });
    }
  };

  /*
   * VERIFY LOGIN OTP
   *
   * This handles both Authenticator and recovery-code verification.
   */
  const handleTwoFactorVerification = async () => {
    if (!twoFactorChallengeId) {
      setTwoFactorError("Two-factor authentication challenge is missing.");
      return;
    }

    const code = twoFactorCode.trim();

    if (twoFactorMethod === "authenticator" && !/^\d{6}$/.test(code)) {
      setTwoFactorError("Enter the 6-digit code from Google Authenticator.");
      return;
    }

    if (twoFactorMethod === "recovery" && !code) {
      setTwoFactorError("Enter one of your recovery codes.");
      return;
    }

    try {
      setTwoFactorError("");

      await verifyTwoFactorMutation.mutateAsync({
        challengeId: twoFactorChallengeId,
        method: twoFactorMethod,
        code,
      });
    } catch (error) {
      setTwoFactorError(
        error instanceof Error
          ? error.message
          : "Invalid Google Authenticator code.",
      );
      setTwoFactorCode("");
    }
  };

  const closeTwoFactorModal = () => {
    if (verifyTwoFactorMutation.isPending) {
      return;
    }

    resetTwoFactorState();
  };

  return (
    <div className="w-full max-w-sm">
      <Tabs active={activeTab} onChange={setActiveTab} />

      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (loginMutation.isPending) {
            return;
          }

          const form = new FormData(e.currentTarget);

          const accountValue = String(form.get("account") ?? account);

          const passwordValue = String(form.get("password") ?? password);

          setAccount(accountValue);
          setPassword(passwordValue);

          void handleLogin(accountValue, passwordValue);
        }}
        className="space-y-6"
      >
        {/* Account */}
        <div className="flex flex-col">
          <span className="flex items-start gap-2">
            <label className="text-red-500">*</label>
            <label className="label">Account</label>
          </span>

          <input
            name="account"
            autoComplete="username"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="Enter Username"
            className={`shadow-md w-full rounded-sm p-1.5 border outline-none transition
              focus:border-blue-500 text-sm
              ${errors.account ? "border-red-500" : "border-gray-300"}`}
          />

          {errors.account && (
            <p className="text-red-500 text-xs mt-1">{errors.account}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <span className="flex items-start gap-2">
            <label className="text-red-500">*</label>
            <label className="label">Password</label>
          </span>

          <div className="relative">
            <input
              name="password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className={`shadow-md w-full rounded-sm p-1.5 pr-10 border outline-none transition
                focus:border-blue-500 text-sm
                ${errors.password ? "border-red-500" : "border-gray-300"}`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <p className="text-red-500 text-sm text-center">{errors.general}</p>
        )}

        {/* Remember + Forgot */}
        <div className="flex justify-between text-sm">
          <label className="flex gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            Remember
          </label>

          {activeTab !== "Service" && (
            <Link href="/forgot-password" className="text-blue-600">
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
            {loginMutation.isPending ? "Checking..." : "Login"}
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

        <p className="text-xs text-center text-gray-400 mt-6">V1.1.1.a</p>
      </form>

      {/* =====================================================
          GOOGLE AUTHENTICATOR LOGIN VERIFICATION
          ===================================================== */}

      {showTwoFactor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Two-Step Verification
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {twoFactorMethod === "authenticator"
                    ? "Enter the 6-digit code from Google Authenticator to continue."
                    : "Use one of your saved recovery codes to continue."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeTwoFactorModal}
                disabled={verifyTwoFactorMutation.isPending}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Close verification"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-gray-900">
                  {twoFactorMethod === "authenticator"
                    ? "Google Authenticator code"
                    : "Recovery code"}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {twoFactorMethod === "authenticator"
                    ? "Open Google Authenticator and enter the current 6-digit code for your Polycab account."
                    : "Enter one unused recovery code that you saved when 2FA was enabled."}
                </p>
              </div>

              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorMethod("authenticator");
                    setTwoFactorCode("");
                    setTwoFactorError("");
                  }}
                  className={`flex-1 rounded-md border px-3 py-2 ${
                    twoFactorMethod === "authenticator"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  Authenticator
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorMethod("recovery");
                    setTwoFactorCode("");
                    setTwoFactorError("");
                  }}
                  className={`flex-1 rounded-md border px-3 py-2 ${
                    twoFactorMethod === "recovery"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  Recovery code
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication code
                </label>

                <input
                  value={twoFactorCode}
                  onChange={(e) => {
                    const value =
                      twoFactorMethod === "authenticator"
                        ? e.target.value.replace(/\D/g, "").slice(0, 6)
                        : e.target.value.slice(0, 32);

                    setTwoFactorCode(value);
                    setTwoFactorError("");
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      (twoFactorMethod === "recovery" ||
                        twoFactorCode.length === 6) &&
                      !verifyTwoFactorMutation.isPending
                    ) {
                      e.preventDefault();
                      void handleTwoFactorVerification();
                    }
                  }}
                  inputMode={
                    twoFactorMethod === "authenticator" ? "numeric" : "text"
                  }
                  autoComplete="one-time-code"
                  maxLength={twoFactorMethod === "authenticator" ? 6 : 32}
                  autoFocus
                  placeholder={
                    twoFactorMethod === "authenticator"
                      ? "000000"
                      : "Enter recovery code"
                  }
                  className="w-full rounded-md border border-gray-300 p-3 text-center text-xl font-mono outline-none focus:border-blue-500"
                />
              </div>

              {twoFactorError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-500">{twoFactorError}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleTwoFactorVerification()}
                disabled={
                  verifyTwoFactorMutation.isPending ||
                  (twoFactorMethod === "authenticator"
                    ? twoFactorCode.length !== 6
                    : !twoFactorCode.trim())
                }
                className="w-full rounded-md bg-blue-500 px-4 py-2.5 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {verifyTwoFactorMutation.isPending
                  ? "Verifying..."
                  : "Verify & Login"}
              </button>

              <button
                type="button"
                onClick={closeTwoFactorModal}
                disabled={verifyTwoFactorMutation.isPending}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
