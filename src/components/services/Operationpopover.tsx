"use client";

import { Settings, Bell } from "lucide-react";

interface OperationPopoverProps {
  onRemoteSetting: () => void;
  onBurn: () => void;
  onAlarmPush: () => void;
  children: React.ReactNode;
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export default function OperationPopover({
  onRemoteSetting,
  onBurn,
  onAlarmPush,
  children,
}: OperationPopoverProps) {
  return (
    <div className="relative group/oppop inline-flex items-center">
      {/* Trigger */}
      {children}

      {/* Popover — above the trigger, centered */}
      <div
        className="
          absolute z-[9999]
          bottom-[calc(100%+12px)]
          left-1/2 -translate-x-1/2
          invisible opacity-0
          group-hover/oppop:visible group-hover/oppop:opacity-100
          transition-opacity duration-150
          pointer-events-none
          group-hover/oppop:pointer-events-auto
          whitespace-nowrap
        "
      >
        {/* Card */}
        <div className="bg-[#3d3d3d] rounded-xl shadow-2xl overflow-hidden">
          <button
            onClick={onRemoteSetting}
            className="flex items-center gap-2.5 w-full px-5 py-3.5 text-white hover:bg-white/10 transition-colors text-left"
          >
            <Settings size={16} className="flex-shrink-0" />
            <span className="text-sm font-medium">-Remote Setting</span>
          </button>
          <button
            onClick={onBurn}
            className="flex items-center gap-2.5 w-full px-5 py-3.5 text-white hover:bg-white/10 transition-colors text-left"
          >
            <UploadIcon />
            <span className="text-sm font-medium">-Burn</span>
          </button>
          <button
            onClick={onAlarmPush}
            className="flex items-center gap-2.5 w-full px-5 py-3.5 text-white hover:bg-white/10 transition-colors text-left"
          >
            <Bell size={16} className="flex-shrink-0" />
            <span className="text-sm font-medium">-Alarm push setting</span>
          </button>
        </div>

        {/* Down-pointing arrow centered below the card */}
        <div className="flex justify-center">
          <div className="w-3.5 h-3.5 bg-[#3d3d3d] rotate-45 -mt-1.5" />
        </div>
      </div>
    </div>
  );
}