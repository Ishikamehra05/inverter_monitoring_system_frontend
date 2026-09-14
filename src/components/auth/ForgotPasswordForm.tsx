"use client";

import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "@/hooks/api/useAuth";
import { toast } from "sonner";

export default function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();

  const [account, setAccount] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendCode = () => {
    if (!account.trim()) {
      toast.error("Please enter account");
      return;
    }

    setOtp("1234");
    toast.success("Verification code sent successfully");
  };

  const handleSubmit = async () => {
    if (!account.trim()) {
      toast.error("Please enter account");
      return;
    }

    if (!otp.trim()) {
      toast.error("OTP is required");
      return;
    }

    if (otp !== "1234") {
      toast.error("OTP not matched or expired");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter new password");
      return;
    }

    if (!confirmPassword.trim()) {
      toast.error("Please confirm password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await forgotPassword.mutateAsync({
        account,
        verificationCode: otp,
        newPassword,
        confirmPassword,
      });

      toast.success(response.message || "Password reset successfully");

      setAccount("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reset password");
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex flex-col gap-2">
        <input
          className="input border border-gray-400 w-full rounded-sm p-1.5"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="Please enter account"
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
          <input
            className="input border border-gray-400 w-full rounded-sm p-1.5"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Code"
          />

          <button
            type="button"
            onClick={handleSendCode}
            className="btn-secondary sm:w-full bg-blue-500 text-white rounded-sm p-1.5 cursor-pointer"
          >
            Verification Code
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="password"
            className="input border border-gray-400 w-full rounded-sm p-1.5"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="password"
            className="input border border-gray-400 w-full rounded-sm p-1.5"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <button
          onClick={handleSubmit}
          disabled={forgotPassword.isPending}
          className="btn-primary bg-blue-500 text-white rounded-sm p-1.5 cursor-pointer"
        >
          {forgotPassword.isPending ? "Submitting..." : "Reset Password"}
        </button>

        <Link href="/login" className="block text-center text-blue-600 mt-4">
          Back to home
        </Link>
      </div>
    </div>
  );
}