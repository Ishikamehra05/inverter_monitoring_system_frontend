"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  ChevronDown,
  LogOut,
  Settings,
  Factory,
  FileText,
  BookOpen,
} from "lucide-react";
import LanguageDropdown from "@/components/ui/LanguageDropdown";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import LogoutForm from "@/components/auth/LogoutForm";
import BrandLogo from "@/components/ui/BrandLogo";
import { navigateMonitor } from "@/utils/monitorNavigation";
import { useLogout } from "@/hooks/api/useAuth";
import { getAuthSession } from "@/lib/auth/session";
import { ArrowLeft } from "lucide-react";

/* ---------- Nav Button ---------- */
type NavButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon: ReactNode;
};

const NavButton = ({ label, active, onClick, icon }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 sm:gap-2 p-2 sm:px-4 sm:py-3 rounded-md text-sm font-medium transition cursor-pointer
      ${active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
  >
    {icon}
    {label}
  </button>
);

const UserDropdown = ({ hideLogout }: { hideLogout?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [accountName, setAccountName] = useState("-");
  const logoutMutation = useLogout();
  const [portal, setPortal] = useState<string | null>(null);

  useEffect(() => {
    const session = getAuthSession();

    if (session.account) {
      setAccountName(session.account);
    }

    setPortal(session.portal);
  }, []);
  const isServicePortal = portal === "service";

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
        <span className="hidden sm:block text-sm text-gray-600">
          {accountName}
        </span>
        <ChevronDown size={16} className="hidden sm:block text-gray-500" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-44 bg-white border rounded-md shadow-md z-50">
          {!isServicePortal && (
            <>
              <Link
                href="/monitor/settings"
                className="w-full px-4 py-2 text-sm flex items-center gap-2 text-black hover:bg-gray-100"
              >
                <Settings size={16} />
                Settings
              </Link>

              {/* <button
                onClick={() => alert("Manual clicked")}
                className="w-full px-4 py-2 text-sm flex items-center gap-2 text-black hover:bg-gray-100 cursor-pointer"
              >
                <BookOpen size={16} />
                Manual
              </button> */}
            </>
          )}

          {/* ✅ Logout Button */}
          {!hideLogout && (
            <button
              onClick={() => setLogoutOpen(true)}
              className="w-full px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-gray-100 cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      )}

      {/* Logout Modal */}
      <LogoutForm
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

/* ---------- Main Header ---------- */
export default function Header({ hideLogout }: { hideLogout?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"Plant" | "Logs">("Plant");

  const fromService = searchParams.get("fromService") === "true";

  const showBackButton = searchParams.get("fromService") === "true";

  const handleNavigation = (tab: "Plant" | "Logs") => {
    setActiveTab(tab);

    if (tab === "Plant") {
      navigateMonitor(router, searchParams, "/monitor/plants");
    } else {
      navigateMonitor(router, searchParams, "/monitor/logs");
    }
  };

  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 px-6">
      <div className="h-full flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-6 md:gap-12">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center p-2 rounded hover:bg-[rgba(255,255,255,0.1)] text-gray-600 transition"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <BrandLogo />

          <div className="flex gap-2">
            <NavButton
              icon={<Factory size={16} />}
              label="Plant"
              active={activeTab === "Plant"}
              onClick={() => handleNavigation("Plant")}
            />
            <NavButton
              icon={<FileText size={16} />}
              label="Logs"
              active={activeTab === "Logs"}
              onClick={() => handleNavigation("Logs")}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-between gap-6">
          <LanguageDropdown />
          <UserDropdown hideLogout={hideLogout} />
        </div>
      </div>
    </header>
  );
}
