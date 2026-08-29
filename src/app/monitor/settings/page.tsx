"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  useChangePassword,
  useServiceProfile,
  useUpdateProfile,
} from "@/hooks/api/useService";
import { ApiError } from "@/lib/api/errors";

type SettingsTab = "general" | "security";

const TIMEZONE_OPTIONS = ["(UTC+05:30) Colombo, New Delhi"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("general");
  const profileQuery = useServiceProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [profile, setProfile] = useState({
    account: "",
    email: "",
    phone: "",
    address: "",
    timezone: "",
  });
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profileQuery.data) return;
    setProfile({
      account: profileQuery.data.account,
      email: profileQuery.data.email,
      phone: profileQuery.data.phone ?? "",
      address: profileQuery.data.address ?? "",
      timezone: profileQuery.data.timezone,
    });
  }, [profileQuery.data]);

  const updateProfileField = (field: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const email = profile.email.trim();
    const phone = profile.phone.trim();
    const address = profile.address.trim();

    if (!email) nextErrors.email = "Email is required.";
    else if (email.length > 254)
      nextErrors.email = "Email must be 254 characters or fewer.";
    else if (!EMAIL_PATTERN.test(email))
      nextErrors.email = "Enter a valid email address.";

    if (!phone) nextErrors.phone = "Phone is required.";
    else if (
      phone.replace(/\D/g, "").length < 7 ||
      phone.replace(/\D/g, "").length > 15
    )
      nextErrors.phone = "Phone must contain 7 to 15 digits.";
    else if (!PHONE_PATTERN.test(phone))
      nextErrors.phone = "Enter a valid phone number.";

    if (!address) nextErrors.address = "Address is required.";
    else if (address.length < 2)
      nextErrors.address = "Address must be at least 2 characters.";
    else if (address.length > 200)
      nextErrors.address = "Address must be 200 characters or fewer.";

    if (!profile.timezone.trim()) nextErrors.timezone = "Timezone is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      const result = await updateProfile.mutateAsync({
        email,
        phone,
        address,
        timezone: profile.timezone,
      });
      toast.success(result.message || "Profile updated successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        const serverErrors = error.errors ?? {};
        const message = error.message.toLowerCase();
        const fieldErrors: Record<string, string> = {};

        if (serverErrors.email || message.includes("email")) {
          fieldErrors.email =
            serverErrors.email || "This email is already in use.";
        }
        if (serverErrors.phone || message.includes("phone")) {
          fieldErrors.phone =
            serverErrors.phone || "This phone number is already in use.";
        }
        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    }
  };

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const oldPassword = passwords.oldPassword.trim();
    const newPassword = passwords.newPassword;
    const confirmPassword = passwords.confirmPassword;

    if (!oldPassword) nextErrors.oldPassword = "Old password is required.";
    if (!newPassword.trim())
      nextErrors.newPassword = "New password is required.";
    else if (newPassword.length < MIN_PASSWORD_LENGTH)
      nextErrors.newPassword = `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    else if (!/[A-Z]/.test(newPassword))
      nextErrors.newPassword = "New password must contain an uppercase letter.";
    else if (!/[a-z]/.test(newPassword))
      nextErrors.newPassword = "New password must contain a lowercase letter.";
    else if (!/[0-9]/.test(newPassword))
      nextErrors.newPassword = "New password must contain a number.";
    if (!confirmPassword.trim())
      nextErrors.confirmPassword = "Confirm password is required.";
    else if (newPassword !== confirmPassword)
      nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      const result = await changePassword.mutateAsync({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      toast.success(result.message || "Password changed successfully.");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update password.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 text-black sm:p-8">
      <div className="flex w-full flex-col rounded-md border border-black/5 bg-white lg:flex-row">
        <aside className="flex w-full overflow-x-auto border-b border-black/5 lg:w-60 lg:flex-col lg:border-b-0 lg:border-r">
          <MenuItem
            active={tab === "general"}
            onClick={() => setTab("general")}
          >
            General Settings
          </MenuItem>
          <MenuItem
            active={tab === "security"}
            onClick={() => setTab("security")}
          >
            Security Settings
          </MenuItem>
        </aside>
        <section className="flex-1 px-4 py-6 sm:px-8">
          {tab === "general" && (
            <form onSubmit={handleProfileSubmit} className="w-full max-w-md">
              <h1 className="mb-6 text-base font-medium">General Settings</h1>
              {profileQuery.isLoading ? (
                <p className="text-sm text-black/50">Loading profile...</p>
              ) : profileQuery.isError ? (
                <p className="text-sm text-red-500">
                  Unable to load profile. Please refresh and try again.
                </p>
              ) : (
                <div className="space-y-5">
                  <Field label="User Name">
                    <Input value={profile.account} disabled />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <Input
                      type="email"
                      maxLength={254}
                      value={profile.email}
                      onChange={(event) =>
                        updateProfileField("email", event.target.value)
                      }
                      disabled={updateProfile.isPending}
                    />
                  </Field>
                  <Field label="Phone" error={errors.phone}>
                    <Input
                      type="tel"
                      inputMode="tel"
                      value={profile.phone}
                      onChange={(event) =>
                        updateProfileField("phone", event.target.value)
                      }
                      disabled={updateProfile.isPending}
                    />
                  </Field>
                  <Field label="Address" error={errors.address}>
                    <Input
                      maxLength={200}
                      value={profile.address}
                      onChange={(event) =>
                        updateProfileField("address", event.target.value)
                      }
                      disabled={updateProfile.isPending}
                    />
                  </Field>
                  <Field label="Timezone" error={errors.timezone}>
                    <select
                      value={profile.timezone}
                      onChange={(event) =>
                        updateProfileField("timezone", event.target.value)
                      }
                      disabled={updateProfile.isPending}
                      className="h-8 w-full rounded-xs border border-[#d9d9d9] bg-white px-2.75 text-sm focus:border-[#40a9ff] focus:outline-none focus:ring-2 focus:ring-[#1890ff]/20 disabled:bg-[#fafafa]"
                    >
                      {!TIMEZONE_OPTIONS.includes(profile.timezone) &&
                        profile.timezone && (
                          <option value={profile.timezone}>
                            {profile.timezone}
                          </option>
                        )}

                      {TIMEZONE_OPTIONS.map((timezone) => (
                        <option key={timezone} value={timezone}>
                          {timezone}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="h-8 rounded-xs border border-[#1890ff] bg-[#1890ff] px-4 text-sm text-white transition hover:border-[#40a9ff] hover:bg-[#40a9ff] disabled:opacity-50"
                  >
                    {updateProfile.isPending ? "Updating..." : "Update"}
                  </button>
                </div>
              )}
            </form>
          )}
          {tab === "security" && (
            <form onSubmit={handlePasswordSubmit} className="w-full max-w-md">
              <h1 className="mb-6 text-base font-medium">Security Settings</h1>
              <div className="space-y-5">
                {(
                  ["oldPassword", "newPassword", "confirmPassword"] as const
                ).map((field) => {
                  const labels = {
                    oldPassword: "Old Password",
                    newPassword: "New Password",
                    confirmPassword: "Confirm Password",
                  };
                  const placeholders = {
                    oldPassword: "Please enter old password",
                    newPassword: "Please enter new password",
                    confirmPassword: "Please confirm password",
                  };
                  return (
                    <Field
                      key={field}
                      label={labels[field]}
                      required
                      error={errors[field]}
                    >
                      <PasswordInput
                        value={passwords[field]}
                        placeholder={placeholders[field]}
                        visible={visiblePasswords[field]}
                        disabled={changePassword.isPending}
                        onChange={(event) => {
                          setPasswords((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }));
                          setErrors((current) => ({ ...current, [field]: "" }));
                        }}
                        onToggle={() =>
                          setVisiblePasswords((current) => ({
                            ...current,
                            [field]: !current[field],
                          }))
                        }
                      />
                    </Field>
                  );
                })}
                <button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="h-8 rounded-xs border border-[#1890ff] bg-[#1890ff] px-4 text-sm text-white transition hover:border-[#40a9ff] hover:bg-[#40a9ff] disabled:opacity-50"
                >
                  {changePassword.isPending ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

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
      type="button"
      onClick={onClick}
      className={`relative whitespace-nowrap px-4 py-3 text-left text-sm transition ${active ? "bg-[#e6f7ff] text-[#1890ff]" : "text-black/65 hover:bg-[#f5f5f5]"}`}
    >
      {active && (
        <span className="absolute left-0 top-0 h-full w-0.75 bg-[#1890ff]" />
      )}
      {children}
    </button>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-black/65">
        {label}
        {required && <span className="ml-1 text-[#ff4d4f]">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[#ff4d4f]">{error}</p>}
    </div>
  );
}

function Input({
  type = "text",
  inputMode,
  maxLength,
  value,
  onChange,
  disabled,
}: {
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="h-8 w-full rounded-xs border border-[#d9d9d9] bg-white px-2.75 text-sm focus:border-[#40a9ff] focus:outline-none focus:ring-2 focus:ring-[#1890ff]/20 disabled:bg-[#fafafa] disabled:text-black/45"
    />
  );
}

function PasswordInput({
  value,
  placeholder,
  visible,
  disabled,
  onChange,
  onToggle,
}: {
  value: string;
  placeholder: string;
  visible: boolean;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className="h-11 w-full rounded-md border border-[#d9d9d9] px-4 pr-12 text-sm outline-none placeholder:text-black/40 focus:border-[#40a9ff] disabled:bg-[#fafafa]"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 hover:text-black/70"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}