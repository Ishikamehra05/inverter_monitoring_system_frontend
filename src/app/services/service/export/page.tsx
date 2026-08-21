"use client";

import { useState } from "react";

export default function AppExportPage() {
  const [showError] = useState(true);

  return (
    <div className="w-full px-4 sm:px-6 pt-6">

      {/* TOP BAR */}
      <div
        className="
          flex flex-col sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
          rounded-[2px]
          border border-[rgba(0,0,0,0.06)]
          bg-white
          px-4 sm:px-6
          py-4
        "
      >
        {/* TITLE */}
        <h2 className="text-[16px] font-medium text-[rgba(0,0,0,0.85)]">
          APP Configuration Export
        </h2>

        {/* SEARCH AREA */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:items-center">

          <input
            placeholder="Please set parameters in the app first"
            className="
              h-8
              w-full sm:w-64
              px-[11px]
              text-[14px]
              border border-[#d9d9d9]
              rounded-[2px]
              bg-white
              placeholder:text-[rgba(0,0,0,0.45)]
              focus:outline-none
              focus:border-[#40a9ff]
              focus:ring-2 focus:ring-[#1890ff]/20
              transition
            "
          />

          <button
            className="
              h-8
              px-4
              text-[14px]
              rounded-[2px]
              border border-[#1890ff]
              bg-[#1890ff]
              text-white
              hover:bg-[#40a9ff]
              hover:border-[#40a9ff]
              transition
              whitespace-nowrap
            "
          >
            Search SN
          </button>

        </div>
      </div>

      {/* CONTENT CARD */}
      <div
        className="
          mt-6
          flex
          min-h-[220px] sm:min-h-[260px]
          items-center
          justify-center
          rounded-[2px]
          border border-[rgba(0,0,0,0.06)]
          bg-white
          px-4
        "
      >
        <div className="flex flex-col items-center gap-3 text-[rgba(0,0,0,0.45)]">

          {/* ICON */}
          <div className="relative">
            <div className="h-10 w-14 rounded-[2px] border border-[rgba(0,0,0,0.15)]" />
            <div
              className="
                absolute -top-2 left-1/2
                h-3 w-6
                -translate-x-1/2
                rounded-t-[2px]
                border border-[rgba(0,0,0,0.15)]
                bg-white
              "
            />
          </div>

          <span className="text-[14px]">
            No data
          </span>
        </div>
      </div>
    </div>
  );
}