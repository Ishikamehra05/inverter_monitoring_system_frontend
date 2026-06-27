"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import {
  useChangePassword,
  useServiceProfile,
  useUpdateProfile,
} from "@/hooks/api/useService";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient";

export default function InformationPage() {
  const [tab, setTab] = useState<"basic" | "security">("basic");
  const profileQuery = useServiceProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    account: "",
    email: "",
    phone: "",
    address: "",
    timezone: "",
  });

  useEffect(() => {
    console.log(profileQuery.data);
  }, [profileQuery.data]);

  useEffect(() => {
    console.log(" Profile API Response:", profileQuery.data);

    if (profileQuery.data) {
      const profile = profileQuery.data;

      setFormData({
        account: profile.account,
        email: profile.email,
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        timezone: profile.timezone ?? "",
      });
    }
  }, [profileQuery.data]);
  useEffect(() => {
    console.log("Form Data:", formData);
  }, [formData]);
  const [errors, setErrors] = useState<any>({});
  const handleSecurityUpdate = async () => {
    const newErrors: any = {};

    if (!oldPassword.trim()) {
      newErrors.oldPassword = "Old password is required";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await changePassword.mutateAsync({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      toast.success(response.message || "Password changed successfully");

      // Clear fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password");
    }
  };

  const searchParams = useSearchParams();

  const selectedEndUserId = searchParams.get("userid") ?? undefined;

  const serviceParams = selectedEndUserId
    ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
    : undefined;

  const handleUpdateProfile = async () => {
    if (!formData.phone.trim()) {
      toast.error("Phone is required.");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required.");
      return;
    }

    if (!formData.timezone.trim()) {
      toast.error("Timezone is required.");
      return;
    }

    try {
      const result = await updateProfile.mutateAsync({
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        timezone: formData.timezone,
      });

      toast.success(result.message ?? "Profile updated successfully.");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to update profile.");
    }
  };
  return (
    <div
      className="
        bg-white
        border border-[rgba(0,0,0,0.06)]
        rounded-xs
        flex flex-col lg:flex-row
        w-full
      "
    >
      {/* ---------------- LEFT MENU ---------------- */}
      <aside
        className="
          w-full lg:w-60
          border-b lg:border-b-0 lg:border-r
          border-[rgba(0,0,0,0.06)]
          flex lg:flex-col
          overflow-x-auto
        "
      >
        <MenuItem active={tab === "basic"} onClick={() => setTab("basic")}>
          Basic Setting
        </MenuItem>

        <MenuItem
          active={tab === "security"}
          onClick={() => setTab("security")}
        >
          Security Setting
        </MenuItem>
      </aside>

      {/* ---------------- CONTENT ---------------- */}
      <section className="flex-1 px-4 sm:px-8 py-6">
        {tab === "basic" && (
          <>
            <h1 className="text-[16px] font-medium text-[rgba(0,0,0,0.85)] mb-6">
              Basic Setting
            </h1>

            <div className="space-y-5 w-full max-w-md">
              <Field label="User Name">
                <Input disabled value={formData.account} />
              </Field>

              <Field label="Email">
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Phone">
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  disabled={updateProfile.isPending}
                />
              </Field>

              <Field label="Address">
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value,
                    })
                  }
                  disabled={updateProfile.isPending}
                />
              </Field>

              <Field label="Timezone">
                <select
                  disabled={updateProfile.isPending}
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timezone: e.target.value,
                    })
                  }
                  className="
                    w-full h-8 px-2.75 text-[14px]
                    border border-[#d9d9d9]
                    rounded-xs
                    focus:outline-none
                    focus:border-[#40a9ff]
                    focus:ring-2 focus:ring-[#1890ff]/20
                  "
                >
                  <option>(UTC+05:30) Colombo, New Delhi</option>
                </select>
              </Field>

              <button
                className="
                  w-full sm:w-auto
                  h-8 px-4
                  text-[14px]
                  rounded-xs
                  border border-[#1890ff]
                  bg-[#1890ff]
                  text-white
                  hover:bg-[#40a9ff]
                  hover:border-[#40a9ff]
                  transition
                "
                onClick={handleUpdateProfile}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </>
        )}

        {tab === "security" && (
          <>
            <h1 className="text-[16px] font-medium text-[rgba(0,0,0,0.85)] mb-6">
              Security Setting
            </h1>

            <div className="space-y-5 w-full max-w-md">
              <Field label="Old Password" required>
                <Input
                  type="password"
                  value={oldPassword}
                  disabled={changePassword.isPending}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={
                    errors.oldPassword ? "border border-[#ff4d4f]" : ""
                  }
                />

                {errors.oldPassword && (
                  <p className="text-[#ff4d4f] text-[12px] mt-1">
                    {errors.oldPassword}
                  </p>
                )}
              </Field>

              <Field label="New Password" required>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  visible={showNew}
                  toggle={() => setShowNew(!showNew)}
                  disabled={changePassword.isPending}
                  error={errors.newPassword}
                />

                {errors.newPassword && (
                  <p className="text-[#ff4d4f] text-[12px] mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </Field>

              <Field label="Confirm Password" required>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  visible={showConfirm}
                  toggle={() => setShowConfirm(!showConfirm)}
                  error={errors.confirmPassword}
                  disabled={changePassword.isPending}
                />

                {errors.confirmPassword && (
                  <p className="text-[#ff4d4f] text-[12px] mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </Field>

              <button
                className="
                  w-full sm:w-auto
                  h-8 px-4
                  text-[14px]
                  rounded-xs
                  border border-[#1890ff]
                  bg-[#1890ff]
                  text-white
                  hover:bg-[#40a9ff]
                  hover:border-[#40a9ff]
                  transition
                "
                onClick={handleSecurityUpdate}
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ---------------- MENU ITEM ---------------- */

function MenuItem({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative whitespace-nowrap px-4 py-3 text-[14px] transition text-left",
        active
          ? "bg-[#e6f7ff] text-[#1890ff]"
          : "text-[rgba(0,0,0,0.65)] hover:bg-[#f5f5f5]",
      )}
    >
      {active && (
        <span className="absolute left-0 top-0 h-full w-0.75 bg-[#1890ff]" />
      )}
      {children}
    </button>
  );
}

/* ---------------- FIELD ---------------- */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-1 text-[14px] text-[rgba(0,0,0,0.65)]">
        {label}
        {required && <span className="text-[#ff4d4f] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ---------------- INPUT ---------------- */

function Input({
  type = "text",
  disabled,
  value,
  onChange,
  className = "",
}: {
  type?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <input
      type={type}
      disabled={disabled}
      value={value}
      onChange={onChange}
      className={`
        w-full h-8 px-2.75 text-[14px]
        border border-[#d9d9d9]
        rounded-xs
        bg-white
        disabled:bg-[#fafafa]
        disabled:text-[rgba(0,0,0,0.45)]
        focus:outline-none
        focus:border-[#40a9ff]
        focus:ring-2 focus:ring-[#1890ff]/20
        transition
        ${className}
      `}
    />
  );
}

/* ---------------- PASSWORD ---------------- */

function PasswordInput({
  visible,
  toggle,
  value,
  onChange,
  error,
  disabled,
}: {
  visible: boolean;
  toggle: () => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          "w-full h-8 px-2.75 pr-10 text-[14px] rounded-xs transition focus:outline-none focus:ring-2",
          error
            ? "border border-[#ff4d4f] focus:ring-[#ff4d4f]/20"
            : "border border-[#d9d9d9] focus:border-[#40a9ff] focus:ring-[#1890ff]/20",
        )}
      />
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.45)]"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
