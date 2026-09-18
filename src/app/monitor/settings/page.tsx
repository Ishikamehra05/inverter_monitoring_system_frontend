"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Copy, ShieldCheck, ShieldOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import {
  useChangePassword,
  useServiceProfile,
  useUpdateProfile,
} from "@/hooks/api/useService";

import { ApiError } from "@/lib/api/errors";
import { authApi } from "@/lib/api/auth";
import { getAuthSession } from "@/lib/auth/session";
import { UserRole } from "@/types/auth";

type SettingsTab = "general" | "security";
type TwoFactorDisableMethod = "authenticator" | "recovery";

type ProfileState = {
  account: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  epcCompany: string;
  epcInstaller: string;
  epcMobile: string;
  epcEmail: string;
  epcAddress: string;
};

const TIMEZONE_OPTIONS = ["(UTC+05:30) Colombo, New Delhi"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;
const MIN_PASSWORD_LENGTH = 8;

const emptyProfileState: ProfileState = {
  account: "",
  email: "",
  phone: "",
  address: "",
  timezone: "",
  epcCompany: "",
  epcInstaller: "",
  epcMobile: "",
  epcEmail: "",
  epcAddress: "",
};

/* ============================================================
   PAGE
   ============================================================ */

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("general");
  const [role, setRole] = useState<UserRole | null>(null);

  const isTwoFactorOnlyRole =
    role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;

  const profileQuery = useServiceProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [profile, setProfile] = useState<ProfileState>(emptyProfileState);

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

  /* ============================================================
     2FA STATE
     ============================================================ */

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [twoFactorStatusError, setTwoFactorStatusError] = useState("");

  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const [twoFactorSetupLoading, setTwoFactorSetupLoading] = useState(false);

  const [twoFactorVerifyLoading, setTwoFactorVerifyLoading] = useState(false);

  const [twoFactorDisableLoading, setTwoFactorDisableLoading] = useState(false);

  const [showSetupModal, setShowSetupModal] = useState(false);

  const [showDisableModal, setShowDisableModal] = useState(false);

  const [twoFactorSecret, setTwoFactorSecret] = useState("");

  const [twoFactorOtpAuthUrl, setTwoFactorOtpAuthUrl] = useState("");

  const [authenticatorAppLinks, setAuthenticatorAppLinks] = useState<{
    android?: string;
    ios?: string;
  }>({});

  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [disableCode, setDisableCode] = useState("");

  const [disableMethod, setDisableMethod] =
    useState<TwoFactorDisableMethod>("authenticator");

  const [copied, setCopied] = useState(false);

  const [twoFactorError, setTwoFactorError] = useState("");

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  /* ============================================================
     PROFILE
     ============================================================ */

  useEffect(() => {
    const sessionRole = getAuthSession().role;

    setRole(sessionRole);

    if (
      sessionRole === UserRole.SUPER_ADMIN ||
      sessionRole === UserRole.ADMIN
    ) {
      setTab("security");
    }
  }, []);

  useEffect(() => {
    if (!profileQuery.data) return;

    setProfile({
      account: profileQuery.data.account ?? "",
      email: profileQuery.data.email ?? "",
      phone: profileQuery.data.phone ?? "",
      address: profileQuery.data.address ?? "",
      timezone: profileQuery.data.timezone ?? "",
      epcCompany: profileQuery.data.epcCompany ?? "",
      epcInstaller: profileQuery.data.epcInstaller ?? "",
      epcMobile: profileQuery.data.epcMobile ?? "",
      epcEmail: profileQuery.data.epcEmail ?? "",
      epcAddress: profileQuery.data.epcAddress ?? "",
    });
  }, [profileQuery.data]);

  /* ============================================================
     LOAD 2FA STATUS
     ============================================================ */

  const loadTwoFactorStatus = async () => {
    try {
      setTwoFactorLoading(true);
      setTwoFactorStatusError("");

      const result = await authApi.getSettingsTwoFactorStatus();

      setTwoFactorEnabled(result.enabled === true);
    } catch (error) {
      console.error("2FA status error:", error);

      setTwoFactorStatusError(
        error instanceof Error
          ? error.message
          : "Unable to load two-factor authentication status.",
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load two-factor authentication status.",
      );
    } finally {
      setTwoFactorLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "security") return;

    void loadTwoFactorStatus();
  }, [tab]);

  /* ============================================================
     PROFILE FIELD
     ============================================================ */

  const updateProfileField = (field: keyof ProfileState, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  /* ============================================================
     PROFILE SUBMIT
     ============================================================ */

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    const email = profile.email.trim();
    const phone = profile.phone.trim();
    const address = profile.address.trim();

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (email.length > 254) {
      nextErrors.email = "Email must be 254 characters or fewer.";
    } else if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!phone) {
      nextErrors.phone = "Phone is required.";
    } else if (
      phone.replace(/\D/g, "").length < 7 ||
      phone.replace(/\D/g, "").length > 15
    ) {
      nextErrors.phone = "Phone must contain 7 to 15 digits.";
    } else if (!PHONE_PATTERN.test(phone)) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!address) {
      nextErrors.address = "Address is required.";
    } else if (address.length < 2) {
      nextErrors.address = "Address must be at least 2 characters.";
    } else if (address.length > 200) {
      nextErrors.address = "Address must be 200 characters or fewer.";
    }

    if (!profile.timezone.trim()) {
      nextErrors.timezone = "Timezone is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const result = await updateProfile.mutateAsync({
        email,
        phone,
        address,
        timezone: profile.timezone,
        epcCompany: profile.epcCompany.trim() || null,
        epcInstaller: profile.epcInstaller.trim() || null,
        epcMobile: profile.epcMobile.trim() || null,
        epcEmail: profile.epcEmail.trim() || null,
        epcAddress: profile.epcAddress.trim() || null,
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

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        }
      }

      toast.error(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    }
  };

  /* ============================================================
     PASSWORD
     ============================================================ */

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    const oldPassword = passwords.oldPassword.trim();

    const newPassword = passwords.newPassword;

    const confirmPassword = passwords.confirmPassword;

    if (!oldPassword) {
      nextErrors.oldPassword = "Old password is required.";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "New password is required.";
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.newPassword = `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    } else if (!/[A-Z]/.test(newPassword)) {
      nextErrors.newPassword = "New password must contain an uppercase letter.";
    } else if (!/[a-z]/.test(newPassword)) {
      nextErrors.newPassword = "New password must contain a lowercase letter.";
    } else if (!/[0-9]/.test(newPassword)) {
      nextErrors.newPassword = "New password must contain a number.";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const result = await changePassword.mutateAsync({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      toast.success(result.message || "Password changed successfully.");

      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setErrors({});
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update password.",
      );
    }
  };

  /* ============================================================
     START 2FA SETUP
     ============================================================ */

  const handleEnableTwoFactor = async () => {
    if (twoFactorSetupLoading || twoFactorEnabled) return;

    try {
      setTwoFactorSetupLoading(true);
      setTwoFactorError("");

      const result = await authApi.setupSettingsTwoFactor();

      setTwoFactorSecret(result.secret);

      setTwoFactorOtpAuthUrl(result.otpauthUrl);

      setAuthenticatorAppLinks(result.authenticatorAppLinks ?? {});

      setTwoFactorCode("");

      setRecoveryCodes([]);

      setShowRecoveryCodes(false);

      setShowSetupModal(true);
    } catch (error) {
      setTwoFactorError(
        error instanceof Error
          ? error.message
          : "Unable to setup Google Authenticator.",
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to setup Google Authenticator.",
      );
    } finally {
      setTwoFactorSetupLoading(false);
    }
  };

  /* ============================================================
     VERIFY 2FA SETUP
     ============================================================ */

  const handleVerifyTwoFactor = async () => {
    if (!/^\d{6}$/.test(twoFactorCode)) {
      setTwoFactorError("Enter the 6-digit Google Authenticator code.");
      return;
    }

    try {
      setTwoFactorVerifyLoading(true);
      setTwoFactorError("");

      const result = await authApi.verifySettingsTwoFactor(twoFactorCode);

      setTwoFactorEnabled(true);

      setRecoveryCodes(result.recoveryCodes ?? []);

      setShowRecoveryCodes(Boolean(result.recoveryCodes?.length));

      toast.success("Two-step verification enabled successfully.");

      if (!result.recoveryCodes?.length) {
        closeSetupModal();
      }
    } catch (error) {
      setTwoFactorError(
        error instanceof Error
          ? error.message
          : "Invalid Google Authenticator code.",
      );
    } finally {
      setTwoFactorVerifyLoading(false);
    }
  };

  /* ============================================================
     DISABLE 2FA
     ============================================================ */

  const handleDisableTwoFactor = async () => {
    const code = disableCode.trim();

    if (disableMethod === "authenticator" && !/^\d{6}$/.test(code)) {
      setTwoFactorError("Enter the current 6-digit Google Authenticator code.");
      return;
    }

    if (disableMethod === "recovery" && !code) {
      setTwoFactorError("Enter one of your recovery codes.");
      return;
    }

    try {
      setTwoFactorDisableLoading(true);
      setTwoFactorError("");

      const result = await authApi.disableSettingsTwoFactor(
        code,
        disableMethod,
      );

      setTwoFactorEnabled(result.enabled === true);

      setDisableCode("");

      setShowDisableModal(false);

      toast.success("Two-step verification disabled successfully.");
    } catch (error) {
      setTwoFactorError(
        error instanceof Error
          ? error.message
          : "Unable to disable two-factor authentication.",
      );
    } finally {
      setTwoFactorDisableLoading(false);
    }
  };

  /* ============================================================
     COPY SECRET
     ============================================================ */

  const handleCopySecret = async () => {
    if (!twoFactorSecret) return;

    try {
      await navigator.clipboard.writeText(twoFactorSecret);

      setCopied(true);

      toast.success("Setup key copied.");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("Unable to copy setup key.");
    }
  };

  /* ============================================================
     CLOSE SETUP MODAL
     ============================================================ */

  const closeSetupModal = () => {
    if (twoFactorSetupLoading || twoFactorVerifyLoading) {
      return;
    }

    setShowSetupModal(false);

    setTwoFactorSecret("");
    setTwoFactorOtpAuthUrl("");
    setAuthenticatorAppLinks({});
    setTwoFactorCode("");
    setTwoFactorError("");
    setCopied(false);
    setShowRecoveryCodes(false);
  };

  /* ============================================================
     CLOSE DISABLE MODAL
     ============================================================ */

  const closeDisableModal = () => {
    if (twoFactorDisableLoading) {
      return;
    }

    setShowDisableModal(false);
    setDisableCode("");
    setDisableMethod("authenticator");
    setTwoFactorError("");
  };

  /* ============================================================
     DOWNLOAD / COPY RECOVERY CODES
     ============================================================ */

  const handleCopyRecoveryCodes = async () => {
    if (!recoveryCodes.length) return;

    try {
      await navigator.clipboard.writeText(recoveryCodes.join("\n"));

      toast.success("Recovery codes copied.");
    } catch {
      toast.error("Unable to copy recovery codes.");
    }
  };

  const handleDownloadRecoveryCodes = () => {
    if (!recoveryCodes.length) return;

    const blob = new Blob([recoveryCodes.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "polycab-recovery-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-black/50">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 text-black sm:p-8">
      <div className="flex w-full flex-col rounded-md border border-black/5 bg-white lg:flex-row">
        {/* =====================================================
            SIDEBAR
            ===================================================== */}

        {!isTwoFactorOnlyRole && (
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
        )}

        <section className="flex-1 px-4 py-6 sm:px-8">
          {/* ===================================================
              GENERAL SETTINGS
              =================================================== */}

          {!isTwoFactorOnlyRole && tab === "general" && (
            <form onSubmit={handleProfileSubmit} className="w-full max-w-2xl">
              <h1 className="mb-6 text-base font-medium">General Settings</h1>

              {profileQuery.isLoading ? (
                <p className="text-sm text-black/50">Loading profile...</p>
              ) : profileQuery.isError ? (
                <p className="text-sm text-red-500">
                  Unable to load profile. Please refresh and try again.
                </p>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="User Name">
                      <Input value={profile.account} disabled />
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
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
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
                  </div>

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

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="EPC Company">
                      <Input
                        value={profile.epcCompany}
                        onChange={(event) =>
                          updateProfileField("epcCompany", event.target.value)
                        }
                        disabled={updateProfile.isPending}
                      />
                    </Field>

                    <Field label="EPC Installer">
                      <Input
                        value={profile.epcInstaller}
                        onChange={(event) =>
                          updateProfileField("epcInstaller", event.target.value)
                        }
                        disabled={updateProfile.isPending}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="EPC Mobile">
                      <Input
                        type="tel"
                        inputMode="tel"
                        value={profile.epcMobile}
                        onChange={(event) =>
                          updateProfileField("epcMobile", event.target.value)
                        }
                        disabled={updateProfile.isPending}
                      />
                    </Field>

                    <Field label="EPC Email">
                      <Input
                        type="email"
                        value={profile.epcEmail}
                        onChange={(event) =>
                          updateProfileField("epcEmail", event.target.value)
                        }
                        disabled={updateProfile.isPending}
                      />
                    </Field>
                  </div>

                  <Field label="EPC Address">
                    <Input
                      value={profile.epcAddress}
                      onChange={(event) =>
                        updateProfileField("epcAddress", event.target.value)
                      }
                      disabled={updateProfile.isPending}
                    />
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

          {/* ===================================================
              SECURITY SETTINGS
              =================================================== */}

          {tab === "security" && (
            <div className="w-full max-w-2xl">
              {!isTwoFactorOnlyRole && (
                <h1 className="mb-6 text-base font-medium">
                  Security Settings
                </h1>
              )}

              {/* ===============================================
                  CHANGE PASSWORD
                  =============================================== */}

              {!isTwoFactorOnlyRole && (
                <form onSubmit={handlePasswordSubmit} className="max-w-md">
                  <h2 className="mb-4 text-sm font-medium">Change Password</h2>

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

                              setErrors((current) => ({
                                ...current,
                                [field]: "",
                              }));
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
                      {changePassword.isPending
                        ? "Updating..."
                        : "Update Password"}
                    </button>
                  </div>
                </form>
              )}

              {/* ===============================================
                  TWO FACTOR
                  =============================================== */}

              <div
                className={`${
                  isTwoFactorOnlyRole
                    ? ""
                    : "mt-10 border-t border-black/10 pt-8"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {twoFactorEnabled ? (
                        <ShieldCheck size={20} className="text-green-600" />
                      ) : (
                        <ShieldOff size={20} className="text-black/50" />
                      )}

                      <h2 className="text-sm font-medium">
                        Two-Step Verification
                      </h2>
                    </div>

                    <p className="mt-2 max-w-xl text-sm text-black/55">
                      Protect your account with an additional 6-digit
                      verification code using Google Authenticator.
                    </p>
                  </div>

                  {twoFactorLoading ? (
                    <span className="text-xs text-black/45">Loading...</span>
                  ) : twoFactorStatusError ? (
                    <span className="text-xs text-red-500">
                      Status unavailable
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        twoFactorEnabled
                          ? "bg-green-50 text-green-700"
                          : "bg-black/5 text-black/55"
                      }`}
                    >
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </span>
                  )}
                </div>

                <div className="mt-6 rounded-md border border-black/10 bg-[#fafafa] p-5">
                  <div>
                    <h3 className="text-sm font-medium">
                      Google Authenticator
                    </h3>

                    <p className="mt-1 text-xs text-black/50">
                      {twoFactorEnabled
                        ? "Google Authenticator is currently protecting your account."
                        : "Add an extra layer of security by using Google Authenticator when signing in."}
                    </p>
                  </div>

                  <div className="mt-5">
                    {twoFactorStatusError && (
                      <p className="mb-3 text-xs text-red-500">
                        Two-factor status could not be loaded. Refresh and try
                        again before changing this setting.
                      </p>
                    )}

                    <button
                      type="button"
                      role="switch"
                      aria-checked={twoFactorEnabled}
                      aria-label="Google Authenticator two-factor authentication"
                      onClick={() => {
                        if (
                          twoFactorLoading ||
                          twoFactorSetupLoading ||
                          twoFactorStatusError
                        )
                          return;

                        if (twoFactorEnabled) {
                          setDisableCode("");
                          setTwoFactorError("");
                          setShowDisableModal(true);
                        } else {
                          void handleEnableTwoFactor();
                        }
                      }}
                      disabled={
                        twoFactorLoading ||
                        twoFactorSetupLoading ||
                        Boolean(twoFactorStatusError)
                      }
                      className={`relative h-7 w-12 rounded-full transition disabled:opacity-50 ${
                        twoFactorEnabled ? "bg-[#1890ff]" : "bg-black/20"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                          twoFactorEnabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* =========================================================
          SETUP MODAL
          ========================================================= */}

      {showSetupModal && (
        <Modal title="Enable Two-Step Verification" onClose={closeSetupModal}>
          {!showRecoveryCodes ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium">
                  Step 1: Install Google Authenticator
                </h3>

                <p className="mt-1 text-xs text-black/55">
                  Install Google Authenticator on your mobile device.
                </p>

                {(authenticatorAppLinks.android ||
                  authenticatorAppLinks.ios) && (
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {authenticatorAppLinks.android && (
                      <a
                        href={authenticatorAppLinks.android}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1890ff] underline"
                      >
                        Android app
                      </a>
                    )}

                    {authenticatorAppLinks.ios && (
                      <a
                        href={authenticatorAppLinks.ios}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1890ff] underline"
                      >
                        iOS app
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium">Step 2: Scan QR Code</h3>

                <p className="mt-1 text-xs text-black/55">
                  Open Google Authenticator and scan the QR code below.
                </p>

                <div className="mt-4 flex min-h-52 items-center justify-center rounded-md border border-black/10 bg-white p-4">
                  {twoFactorOtpAuthUrl ? (
                    <QRCode value={twoFactorOtpAuthUrl} />
                  ) : (
                    <p className="text-xs text-black/45">
                      QR code unavailable.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">
                  Step 3: Manual Setup Key
                </h3>

                <div className="mt-2 flex gap-2">
                  <input
                    readOnly
                    value={twoFactorSecret}
                    className="h-9 min-w-0 flex-1 rounded-md border border-[#d9d9d9] bg-[#fafafa] px-3 text-xs"
                  />

                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="flex h-9 items-center gap-1 rounded-md border border-[#d9d9d9] px-3 text-xs hover:bg-[#f5f5f5]"
                  >
                    <Copy size={14} />

                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Step 4: Verify</h3>

                <p className="mt-1 text-xs text-black/55">
                  Enter the 6-digit code shown in Google Authenticator.
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setTwoFactorCode(value);

                    setTwoFactorError("");
                  }}
                  placeholder="Enter 6-digit code"
                  className="mt-3 h-10 w-full rounded-md border border-[#d9d9d9] px-3 text-center text-lg tracking-[0.4em] outline-none focus:border-[#1890ff]"
                />

                {twoFactorError && (
                  <p className="mt-2 text-xs text-red-500">{twoFactorError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeSetupModal}
                  disabled={twoFactorVerifyLoading}
                  className="h-9 rounded-md border border-[#d9d9d9] px-4 text-sm hover:bg-[#f5f5f5]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleVerifyTwoFactor}
                  disabled={
                    twoFactorVerifyLoading || twoFactorCode.length !== 6
                  }
                  className="h-9 rounded-md bg-[#1890ff] px-4 text-sm text-white hover:bg-[#40a9ff] disabled:opacity-50"
                >
                  {twoFactorVerifyLoading ? "Verifying..." : "Verify & Enable"}
                </button>
              </div>
            </div>
          ) : (
            /* ===============================================
               RECOVERY CODES
               =============================================== */

            <div className="space-y-5">
              <div className="rounded-md bg-green-50 p-4">
                <h3 className="text-sm font-medium text-green-700">
                  Two-step verification enabled
                </h3>

                <p className="mt-1 text-xs text-green-700/80">
                  Save these recovery codes in a secure location. They can be
                  used if you lose access to your Authenticator application.
                </p>
              </div>

              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
                <h3 className="text-sm font-semibold">
                  Important: save your recovery codes
                </h3>

                <p className="mt-1 text-xs leading-5">
                  If you delete the Authenticator app or lose access to the
                  codes it generates, you may be unable to recover your account.
                  Copy or download these recovery codes and store them safely.
                </p>
              </div>

              {recoveryCodes.length > 0 && (
                <div>
                  <div className="grid grid-cols-2 gap-2 rounded-md border border-black/10 bg-[#fafafa] p-4">
                    {recoveryCodes.map((code) => (
                      <div
                        key={code}
                        className="rounded border border-black/10 bg-white px-3 py-2 text-center font-mono text-sm"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyRecoveryCodes}
                    className="mt-3 flex h-9 items-center gap-2 rounded-md border border-[#d9d9d9] px-4 text-sm hover:bg-[#f5f5f5]"
                  >
                    <Copy size={14} />
                    Copy Recovery Codes
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadRecoveryCodes}
                    className="mt-3 ml-2 h-9 rounded-md border border-[#d9d9d9] px-4 text-sm hover:bg-[#f5f5f5]"
                  >
                    Download Recovery Codes
                  </button>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeSetupModal}
                  className="h-9 rounded-md bg-[#1890ff] px-5 text-sm text-white hover:bg-[#40a9ff]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* =========================================================
          DISABLE MODAL
          ========================================================= */}

      {showDisableModal && (
        <Modal
          title="Disable Two-Step Verification"
          onClose={closeDisableModal}
        >
          <div className="space-y-5">
            <p className="text-sm text-black/60">
              {disableMethod === "authenticator"
                ? "Enter your current Google Authenticator 6-digit code to disable two-step verification."
                : "Enter one unused recovery code to disable two-step verification."}
            </p>

            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setDisableMethod("authenticator");
                  setDisableCode("");
                  setTwoFactorError("");
                }}
                className={`flex-1 rounded-md border px-3 py-2 ${
                  disableMethod === "authenticator"
                    ? "border-[#1890ff] bg-[#e6f7ff] text-[#096dd9]"
                    : "border-[#d9d9d9] text-black/60"
                }`}
              >
                Authenticator
              </button>
              <button
                type="button"
                onClick={() => {
                  setDisableMethod("recovery");
                  setDisableCode("");
                  setTwoFactorError("");
                }}
                className={`flex-1 rounded-md border px-3 py-2 ${
                  disableMethod === "recovery"
                    ? "border-[#1890ff] bg-[#e6f7ff] text-[#096dd9]"
                    : "border-[#d9d9d9] text-black/60"
                }`}
              >
                Recovery code
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm text-black/65">
                {disableMethod === "authenticator"
                  ? "Authenticator Code"
                  : "Recovery Code"}
              </label>

              <input
                type="text"
                inputMode={
                  disableMethod === "authenticator" ? "numeric" : "text"
                }
                autoComplete="one-time-code"
                maxLength={disableMethod === "authenticator" ? 6 : 32}
                value={disableCode}
                onChange={(event) => {
                  const value =
                    disableMethod === "authenticator"
                      ? event.target.value.replace(/\D/g, "").slice(0, 6)
                      : event.target.value.slice(0, 32);

                  setDisableCode(value);

                  setTwoFactorError("");
                }}
                placeholder={
                  disableMethod === "authenticator"
                    ? "Enter 6-digit code"
                    : "Enter recovery code"
                }
                className="h-10 w-full rounded-md border border-[#d9d9d9] px-3 text-center text-lg outline-none focus:border-[#1890ff]"
              />

              {twoFactorError && (
                <p className="mt-2 text-xs text-red-500">{twoFactorError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDisableModal}
                disabled={twoFactorDisableLoading}
                className="h-9 rounded-md border border-[#d9d9d9] px-4 text-sm hover:bg-[#f5f5f5]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDisableTwoFactor}
                disabled={
                  twoFactorDisableLoading ||
                  (disableMethod === "authenticator"
                    ? disableCode.length !== 6
                    : !disableCode.trim())
                }
                className="h-9 rounded-md bg-red-500 px-4 text-sm text-white hover:bg-red-600 disabled:opacity-50"
              >
                {twoFactorDisableLoading ? "Disabling..." : "Confirm Disable"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================================================================
   MENU
   ================================================================ */

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
      className={`relative whitespace-nowrap px-4 py-3 text-left text-sm transition ${
        active
          ? "bg-[#e6f7ff] text-[#1890ff]"
          : "text-black/65 hover:bg-[#f5f5f5]"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-0 h-full w-0.75 bg-[#1890ff]" />
      )}

      {children}
    </button>
  );
}

/* ================================================================
   FIELD
   ================================================================ */

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

/* ================================================================
   INPUT
   ================================================================ */

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

/* ================================================================
   PASSWORD INPUT
   ================================================================ */

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

/* ================================================================
   MODAL
   ================================================================ */

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 className="text-base font-medium">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-black/45 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ================================================================
   SIMPLE QR CODE
   ================================================================ */

function QRCode({ value }: { value: string }) {
  return (
    <QRCodeSVG value={value} size={220} title="Google Authenticator QR Code" />
  );
}
