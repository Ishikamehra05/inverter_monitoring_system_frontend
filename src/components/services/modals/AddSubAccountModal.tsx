"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

/* ===================== TYPES ===================== */

type AddSubAccountModalProps = {
  onClose: () => void;
};

type InputProps = {
  placeholder: string;
};

type PasswordInputProps = {
  placeholder: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

/* ===================== COMPONENT ===================== */

export default function AddSubAccountModal({
  onClose,
}: AddSubAccountModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
          <Input placeholder="Please enter user name" />

          <PasswordInput
            placeholder="Please enter password"
            show={showPassword}
            setShow={setShowPassword}
          />

          <PasswordInput
            placeholder="Please confirm password"
            show={showConfirm}
            setShow={setShowConfirm}
          />

          <Input placeholder="Please enter mobile number" />
          <Input placeholder="Please enter email" />

          {/* Timezone */}
          <select
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
            <option value="UTC+08:00">(UTC+08:00) China</option>
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
              transition
            "
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== REUSABLE INPUTS ===================== */

function Input({ placeholder }: InputProps) {
  return (
    <input
      placeholder={placeholder}
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
}: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
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
