"use client";

import { useState } from "react";
import { useCreateMonitorUser } from "@/hooks/api/useService";
import { PasswordInput } from "@/components/services/modals/passwordInput"
import { toast } from "sonner";

type Props = {
  onClose: () => void;
};

export default function CreateUserModal({ onClose }: Props) {
  const createMonitorUser = useCreateMonitorUser();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    account: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
    timezone: "",
  });

  const handleChange =
    (field: keyof typeof form) =>
      (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      ) => {
        setForm((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
      };

  const handleSubmit = async () => {
    try {
      await createMonitorUser.mutateAsync(form);

      toast.success("Monitor account created successfully");
      onClose();
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to create monitor account"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-[520px] bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h2 className="text-[22px] font-medium text-[#262626]">
            Create Monitor Account
          </h2>

          <button
            onClick={onClose}
            className="text-[#8c8c8c] text-xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          <Input
            value={form.account}
            onChange={handleChange("account")}
            placeholder="Please enter user name"
          />

          <PasswordInput
            value={form.password}
            onChange={handleChange("password")}
            placeholder="Please enter password"
            visible={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
          />

          <PasswordInput
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            placeholder="Please confirm password"
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((prev) => !prev)}
          />

          <Input
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder="Please enter mobile number"
          />

          <Input
            value={form.email}
            onChange={handleChange("email")}
            placeholder="Please enter email"
          />

          <select
            value={form.timezone}
            onChange={handleChange("timezone")}
            className="w-full h-[44px] px-4 border border-[#d9d9d9] rounded-md focus:outline-none focus:border-[#1677ff]"
          >
            <option value="">Please select a timezone</option>
            <option value="UTC+05:30">UTC+05:30</option>
            {/* <option value="UTC+00:00">UTC+00:00</option>
            <option value="UTC-05:00">UTC-05:00</option> */}
          </select>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t border-[#f0f0f0]">
          <button
            onClick={onClose}
            className="h-10 px-6 border border-[#d9d9d9] rounded bg-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={createMonitorUser.isPending}
            className="h-10 px-6 text-white bg-[#1677ff] rounded disabled:opacity-50"
          >
            {createMonitorUser.isPending ? "Creating..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
};

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: InputProps) {
  return (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      className="w-full h-[44px] px-4 border border-[#d9d9d9] rounded-md focus:outline-none focus:border-[#1677ff]"
    />
  );
}