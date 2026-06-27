"use client";

import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "@/hooks/api/useAuth";
import { toast } from "sonner";

export default function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [account, setAccount] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [accountValidated, setAccountValidated] = useState(false);
  const handleSubmit = async () => {
    if (!account.trim()) {
      toast.error("Please enter account");
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
        newPassword,
        confirmPassword,
      });

      toast.success(response.message || "Password reset successfully");

      setAccount("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reset password");
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex flex-col gap-2">
        <span className="flex gap-2">
          <label className="label text-red-500">*</label>
          <label className="label">Account</label>
        </span>
        <input
          className="input shadow-md border border-gray-50 w-full rounded-sm p-1.5"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="Please enter account"
        />

        <div className="flex flex-col gap-2">
          <span className="flex gap-2">
            <label className="label text-red-500">*</label>
            <label className="label">New Password</label>
          </span>

          <input
            type="password"
            className="input shadow-md border border-gray-50 w-full rounded-sm p-1.5"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="flex gap-2">
            <label className="label text-red-500">*</label>
            <label className="label">Confirm Password</label>
          </span>

          <input
            type="password"
            className="input shadow-md border border-gray-50 w-full rounded-sm p-1.5"
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
          className="btn-primary bg-blue-500 text-white rounded-sm p-1.5  cursor-pointer"
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
