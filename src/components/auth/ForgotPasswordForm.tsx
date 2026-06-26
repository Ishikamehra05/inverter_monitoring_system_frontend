"use client";

import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "@/hooks/api/useAuth";

export default function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [account, setAccount] = useState("");

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
      </div>

      <div className="flex flex-col">
        <button
          onClick={() => forgotPassword.mutate({ account })}
          className="btn-primary bg-blue-500 text-white rounded-sm p-1.5  cursor-pointer"
        >
          {forgotPassword.isPending ? "Sending..." : "Send email"}
        </button>

        <Link href="/login" className="block text-center text-blue-600 mt-4">
          Back to home
        </Link>
      </div>
    </div>
  );
}
