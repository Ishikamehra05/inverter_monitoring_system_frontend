"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useChangePassword } from "@/hooks/api/useAuth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const changePasswordMutation = useChangePassword();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    if (!oldPassword.trim()) {
      setError("Old password is required.");
      return;
    }

    if (!newPassword.trim()) {
      setError("New password is required.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Confirm password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await changePasswordMutation.mutateAsync({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      setSuccessMessage(
        response?.message || "Password changed successfully."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update password."
      );
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen p-8 text-black">
      <div className="bg-white rounded-md p-8">
        <h1 className="text-3xl font-medium mb-12">
          User Settings
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="max-w-4xl"
        >
          {/* Old Password */}
          <div className="flex flex-col md:flex-row md:items-center mb-8">
            <label className="md:w-52 text-lg mb-2 md:mb-0">
              <span className="text-red-500">*</span> Old Password :
            </label>

            <div className="relative w-full max-w-md">
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Please enter old password"
                className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showOldPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col md:flex-row md:items-center mb-8">
            <label className="md:w-52 text-lg mb-2 md:mb-0">
              <span className="text-red-500">*</span> New Password :
            </label>

            <div className="relative w-full max-w-md">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Please enter new password"
                className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showNewPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col md:flex-row md:items-center mb-8">
            <label className="md:w-52 text-lg mb-2 md:mb-0">
              <span className="text-red-500">*</span> Confirm Password :
            </label>

            <div className="relative w-full max-w-md">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Please confirm password"
                className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="md:ml-52 mb-6">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Button */}
          <div className="md:ml-52">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md disabled:opacity-50"
            >
              {changePasswordMutation.isPending
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}