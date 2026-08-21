"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useCreateSubAccount } from "../../../hooks/api/useUsers";
import { toast } from "sonner";

/* ===================== TYPES ===================== */

type AddSubAccountModalProps = {
  onClose: () => void;
};

type InputProps = {
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type PasswordInputProps = {
  placeholder: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

/* ===================== COMPONENT ===================== */

export default function AddSubAccountModal({
  onClose,
}: AddSubAccountModalProps) {
  const createSubAccount = useCreateSubAccount();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    account: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    email: "",
    timezone: "",
  });

  const handleSubmit = async () => {
    if (
      !form.account ||
      !form.password ||
      !form.confirmPassword ||
      !form.mobileNumber ||
      !form.email ||
      !form.timezone
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await createSubAccount.mutateAsync({
        account: form.account,
        password: form.password,
        confirmPassword: form.confirmPassword,
        email: form.email,
        mobileNumber: form.mobileNumber,
        timezone: form.timezone,
        role: "service_admin",
        portal: "service",
      });
      toast.success("Sub-user created successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create subaccount");
    }
  };

  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center bg-black/40 px-4">
      {/* Modal */}
      <div
        className="
          relative
          w-full
          max-w-md
          rounded-xl
          bg-(--card)
          text-(--foreground)
          border border-(--border)
          shadow-md
          px-5 sm:px-6
          py-6
          max-h-[90vh]
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-(--strong-fg)">
            Add Subaccount
          </h2>

          <button
            onClick={onClose}
            className="text-(--muted-fg) hover:text-(--foreground) transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            placeholder="Please enter user name"
            value={form.account}
            onChange={(e) => setForm({ ...form, account: e.target.value })}
          />

          <PasswordInput
            placeholder="Please enter password"
            show={showPassword}
            setShow={setShowPassword}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <PasswordInput
            placeholder="Please confirm password"
            show={showConfirm}
            setShow={setShowConfirm}
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />

          <Input
            placeholder="Please enter mobile number"
            value={form.mobileNumber}
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
          />
          <Input
            placeholder="Please enter email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* Timezone */}
          <select
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className="
              w-full
              h-10
              rounded-md
              border border-(--input)
              bg-(--surface)
              px-3
              text-sm
              focus:outline-none
              focus:border-(--primary)
            "
          >
            <option value="">Please select a timezone</option>
            <option value="UTC+05:30">(UTC+05:30) India</option>
            {/* <option value="UTC+08:00">(UTC+08:00) China</option> */}
          </select>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="
              w-full sm:w-auto
              rounded-md
              border border-(--border)
              bg-(--surface)
              px-4
              py-2
              text-sm
              hover:bg-(--surface-hover)
              transition
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={createSubAccount.isPending}
            className="
              w-full sm:w-auto
              rounded-md
              bg-(--primary)
              text-(--primary-fg)
              px-5
              py-2
              text-sm
              font-medium
              hover:bg-(--primary-hover)
              disabled:opacity-50
              transition
            "
          >
            {createSubAccount.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== REUSABLE INPUTS ===================== */

function Input({ placeholder, value, onChange }: InputProps) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="
        w-full
        h-10
        rounded-md
        border border-(--input)
        bg-(--surface)
        px-3
        text-sm
        placeholder:text-(--muted-fg)
        focus:outline-none
        focus:border-(--primary)
      "
    />
  );
}

function PasswordInput({
  placeholder,
  show,
  setShow,
  value,
  onChange,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          w-full
          h-10
          rounded-md
          border border-(--input)
          bg-(--surface)
          px-3
          pr-10
          text-sm
          placeholder:text-(--muted-fg)
          focus:outline-none
          focus:border-(--primary)
        "
      />

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-(--muted-fg)
          hover:text-(--foreground)
          transition
        "
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
