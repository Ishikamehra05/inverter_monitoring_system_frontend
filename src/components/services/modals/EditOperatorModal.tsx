"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

type EditOperatorModalProps = {
  userName: string;
  phone: string;
  email: string;
  timezone: string;
  onClose: () => void;
};

export default function EditOperatorModal({
  userName,
  phone,
  email,
  timezone,
  onClose,
}: EditOperatorModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError] = useState(true); // demo

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center sm:items-start sm:pt-[100px]">

      {/* Modal Container */}
      <div
        className="
          w-full
          h-full
          sm:h-auto
          sm:max-w-[520px]
          bg-white
          sm:rounded-[6px]
          shadow-[0_3px_6px_-4px_rgba(0,0,0,.12),0_6px_16px_0_rgba(0,0,0,.08),0_9px_28px_8px_rgba(0,0,0,.05)]
          flex
          flex-col
        "
      >

        {/* ================= HEADER ================= */}
        <div className="px-5 sm:px-6 py-4 border-b border-[rgba(0,0,0,0.06)] flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-[16px] sm:text-[18px] font-medium text-[rgba(0,0,0,0.85)]">
            Edit Operator
          </h2>

          <X
            size={20}
            onClick={onClose}
            className="cursor-pointer text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)]"
          />
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 text-[14px] leading-[1.5715] text-[rgba(0,0,0,0.85)]">

          <FormRow label="User Name">
            <span className="break-all">{userName}</span>
          </FormRow>

          <FormRow label="Password">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="If necessary,please enter new password"
                  className={`w-full h-[38px] px-3 pr-10 border rounded-[4px] outline-none transition ${
                    passwordError
                      ? "border-[#ff4d4f]"
                      : "border-[#d9d9d9]"
                  } focus:border-[#40a9ff]`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)]"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              {passwordError && (
                <div className="text-[#ff4d4f] text-[13px] mt-1">
                  Field validation error for Password
                </div>
              )}
            </div>
          </FormRow>

          <FormRow label="Phone">
            <input
              defaultValue={phone}
              className="w-full h-[38px] px-3 border border-[#d9d9d9] rounded-[4px] focus:border-[#40a9ff] outline-none transition"
            />
          </FormRow>

          <FormRow label="Email">
            <input
              defaultValue={email}
              className="w-full h-[38px] px-3 border border-[#d9d9d9] rounded-[4px] focus:border-[#40a9ff] outline-none transition"
            />
          </FormRow>

          <FormRow label="Timezone">
            <select
              defaultValue={timezone}
              className="w-full h-[38px] px-3 border border-[#d9d9d9] rounded-[4px] focus:border-[#40a9ff] outline-none transition bg-white"
            >
              <option value="UTC+05:30">
                (UTC+05:30) Chennai,Kolkata,Mumbai,New Delhi
              </option>
              <option value="UTC+08:00">
                (UTC+08:00) Beijing
              </option>
            </select>
          </FormRow>

        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-5 sm:px-6 py-4 border-t border-[rgba(0,0,0,0.06)] bg-white sticky bottom-0">

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">

            <button
              onClick={onClose}
              className="w-full sm:w-auto h-[38px] px-5 border border-[#d9d9d9] rounded-[4px] bg-white hover:border-[#40a9ff] hover:text-[#40a9ff] transition"
            >
              Cancel
            </button>

            <button className="w-full sm:w-auto h-[38px] px-5 rounded-[4px] bg-[#1890ff] text-white hover:bg-[#40a9ff] transition">
              Submit
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

/* ================= RESPONSIVE FORM ROW ================= */

function FormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">

      {/* Desktop */}
      <div className="hidden sm:flex items-start">
        <div className="w-[30%] pr-4 text-right">
          {label} :
        </div>

        <div className="w-[70%]">
          {children}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col sm:hidden gap-2">
        <div className="font-medium text-center">
          {label}
        </div>
        {children}
      </div>

    </div>
  );
}