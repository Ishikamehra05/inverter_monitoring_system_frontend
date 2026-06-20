"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <Globe size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-700 rounded-md shadow-lg p-1 space-y-1 z-50">
          <button className="block w-full px-3 py-1 text-left text-sm hover:bg-blue-500/80 text-black rounded cursor-pointer">
            English
          </button>
          <button className="block w-full px-3 py-1 text-left text-sm hover:bg-blue-500/80 text-black rounded cursor-pointer">
            हिंदी
          </button>
          <button className="block w-full px-3 py-1 text-left text-sm hover:bg-blue-500/80 text-black rounded cursor-pointer">
            中文
          </button>
        </div>
      )}
    </div>
  );
}
