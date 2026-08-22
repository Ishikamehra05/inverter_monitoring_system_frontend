"use client";

import { useEffect, useState } from "react";
import { Globe, Earth } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import { UserRole } from "@/types/auth";
export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [isEndUser, setIsEndUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsEndUser(getAuthSession().role === UserRole.END_USER);
  }, []);

  return (
    <div className="relative">
      {isEndUser && (
        <button
          onClick={() => router.push("/monitor/plants/global")}
          aria-label="Global monitoring map"
          title="Global monitoring map"
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 cursor-pointer mr-10"
        >
          <Earth size={18} />
        </button>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <Globe size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-700 rounded-md shadow-lg p-1 space-y-1 z-50">
          <button
            onClick={() => {
              // language change logic here
              setOpen(false);
            }}
            className="block w-full px-3 py-1 text-left text-sm hover:bg-blue-500/80 text-black rounded cursor-pointer"
          >
            English
          </button>
          {/* <button className="block w-full px-3 py-1 text-left text-sm hover:bg-blue-500/80 text-black rounded cursor-pointer">
            हिंदी
          </button>
          <button className="block w-full px-3 py-1 text-left text-sm hover:bg-blue-500/80 text-black rounded cursor-pointer">
            中文
          </button> */}
        </div>
      )}
    </div>
  );
}
