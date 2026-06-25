"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import Image from "next/image";
import LanguageDropdown from "@/components/ui/LanguageDropdown";
import BrandLogo from "@/components/ui/BrandLogo";
import LogoutForm from "@/components/auth/LogoutForm";
import { useLogout } from "@/hooks/api/useAuth";
import { getAuthSession } from "@/lib/auth/session";

const UserDropdown = () => {
  const [open, setOpen] = useState(false); // 👈 dropdown ke liye
  const [logoutOpen, setLogoutOpen] = useState(false); // 👈 modal ke liye
  const [accountName, setAccountName] = useState("-");
  const logoutMutation = useLogout();

  useEffect(() => {
    const { account } = getAuthSession();
    if (account) {
      setAccountName(account);
    }
  }, []);

  const handleConfirmLogout = () => {
    setLogoutOpen(false);
    setOpen(false); // dropdown bhi close ho jaye
    logoutMutation.mutate();
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <User size={16} />
        </div>
        <span className="hidden sm:block text-sm text-gray-300">{accountName}</span>
        <ChevronDown size={16} className="hidden sm:block text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-44 bg-white border rounded-md shadow-md z-50">
          {/* ✅ Logout Button */}
          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-gray-100 cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      {/* ✅ Logout Modal */}
      <LogoutForm
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header
      className="
        ant-pro-global-header ant-pro-global-header-layout-mix
        h-14
        w-full
        bg-[#001529]
        px-4 sm:px-6
        shadow-[0_1px_4px_rgba(0,21,41,0.08)]
        flex
        items-center
        relative
      "
    >
      <div className="flex items-center justify-between h-full w-full min-w-0">
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onMenuClick}
            className="
              lg:hidden
              p-2
              rounded
              hover:bg-[rgba(255,255,255,0.1)]
              transition
              text-white
            "
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <BrandLogo />
        </div>

        {/* ================= RIGHT ================= */}

        <div className="flex items-center justify-between gap-6">
          <LanguageDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
