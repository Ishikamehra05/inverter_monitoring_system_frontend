"use client";

import { useState, useEffect } from "react";
import Tabs from "./Tabs";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/hooks/api/useAuth";
type TabType = "Monitoring" | "Service";

interface LoginErrors {
  account?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  const loginMutation = useLogin();

  const [activeTab, setActiveTab] = useState<TabType>("Monitoring");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async (accountValue: string, passwordValue: string) => {
    setErrors({});

    if (!validateFields(accountValue, passwordValue)) return;

    try {
      await loginMutation.mutateAsync({
        portal: activeTab === "Monitoring" ? "monitoring" : "service",
        account: accountValue,
        password: passwordValue,
        remember,
      });
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  useEffect(() => {
  const saved = localStorage.getItem("rememberedLogin");

  if (saved) {
    const credentials = JSON.parse(saved);

    setAccount(credentials.account || "");
    setPassword(credentials.password || "");
    setRemember(true);

    setActiveTab(
      credentials.portal === "service"
        ? "Service"
        : "Monitoring"
    );
  }
}, []);

  return (
    <div className="w-full max-w-sm">
      <Tabs active={activeTab} onChange={setActiveTab} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (loginMutation.isPending) return;

          const form = new FormData(e.currentTarget);
          const accountValue = String(form.get("account") ?? account);
          const passwordValue = String(form.get("password") ?? password);

          setAccount(accountValue);
          setPassword(passwordValue);

          handleLogin(accountValue, passwordValue);
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
              ${errors.account ? "border-red-500" : "border-gray-300"}
            `}
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
        ${errors.password ? "border-red-500" : "border-gray-300"}
      `}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
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
            {loginMutation.isPending ? "Logging in..." : "Login"}
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

        <p className="text-xs text-center text-gray-400 mt-6">V 1.11.2</p>
      </form>
    </div>
  );
}
