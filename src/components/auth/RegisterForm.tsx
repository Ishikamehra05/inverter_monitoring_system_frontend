"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useRegister,
  useSendVerificationCode,
} from "@/hooks/api/useAuth";

export default function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const sendCode = useSendVerificationCode();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    account: "",
    password: "",
    confirmPassword: "",
    email: "",
    timezone: "(UTC+5:30) Colombo, New Delhi",
    verificationCode: "",
  });

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.account.trim()) return "Account is required.";
    if (!form.password.trim()) return "Password is required.";
    if (!form.confirmPassword.trim()) return "Confirm password is required.";
    if (form.password !== form.confirmPassword) {
      return "Password and confirm password must match.";
    }
    if (!form.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.verificationCode.trim()) return "Verification code is required.";
    return null;
  };

  const handleRegisterSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await register.mutateAsync(form);
      setSuccessMessage("Registration successful. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Registration failed.",
      );
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <h2 className="text-xl font-semibold mb-6 text-center">Register</h2>

      <input
        className="input border border-gray-400 w-full rounded-sm p-1.5"
        value={form.account}
        onChange={(e) => setField("account", e.target.value)}
        placeholder="Please enter account"
      />
      <input
        className="input border border-gray-400 w-full rounded-sm p-1.5"
        type="password"
        value={form.password}
        onChange={(e) => setField("password", e.target.value)}
        placeholder="Please enter your password"
      />
      <input
        className="input border border-gray-400 w-full rounded-sm p-1.5"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => setField("confirmPassword", e.target.value)}
        placeholder="Please enter your confirm password"
      />
      <input
        className="input border border-gray-400 w-full rounded-sm p-1.5"
        value={form.email}
        onChange={(e) => setField("email", e.target.value)}
        placeholder="Please enter your email"
      />

      <select
        value={form.timezone}
        onChange={(e) => setField("timezone", e.target.value)}
        className="input border border-gray-400 w-full rounded-sm p-1.5"
      >
        <option>(UTC+5:30) Colombo, New Delhi</option>
      </select>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
        <input
          className="input border border-gray-400 w-full rounded-sm p-1.5"
          value={form.verificationCode}
          onChange={(e) => setField("verificationCode", e.target.value)}
          placeholder="Code"
        />
        <button
          type="button"
          onClick={() =>
            sendCode.mutate({
              account: form.account,
              email: form.email,
              purpose: "registration",
            })
          }
          disabled={sendCode.isPending}
          className="btn-secondary sm:w-full bg-blue-500 text-white rounded-sm p-1.5 cursor-pointer"
        >
          {sendCode.isPending ? "Sending..." : "Verification Code"}
        </button>
      </div>

      {errorMessage && (
        <p className="text-red-500 text-sm text-center">{errorMessage}</p>
      )}

      {successMessage && (
        <p className="text-green-600 text-sm text-center">{successMessage}</p>
      )}

      <div className="flex flex-col">
        <button
          type="button"
          onClick={handleRegisterSubmit}
          disabled={register.isPending}
          className="btn-primary bg-blue-500 text-white rounded-sm p-1.5  cursor-pointer"
        >
          {register.isPending ? "Registering..." : "Register"}
        </button>
        <Link
          href="/login"
          className="text-center text-sm mt-3 text-blue-600 cursor-pointer"
        >
          Already have an account?
        </Link>
      </div>
    </div>
  );
}
