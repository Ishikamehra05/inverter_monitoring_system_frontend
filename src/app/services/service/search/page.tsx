"use client";

import { useState } from "react";
import clsx from "clsx";

type Mode = "sn" | "datalogger" | "user" | "module";

const MODE_TITLE: Record<Mode, string> = {
  sn: "Search Device(SN)",
  datalogger: "Search Device(Datalogger)",
  user: "Search User",
  module: "Search Module",
};

export default function GlobalSearchPage() {
  const [mode, setMode] = useState<Mode>("sn");

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-xs flex flex-col lg:flex-row min-h-105 w-full">

      {/* ---------- LEFT MENU ---------- */}
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[rgba(0,0,0,0.06)] flex lg:flex-col overflow-x-auto">

        <MenuItem active={mode === "sn"} onClick={() => setMode("sn")}>
          Search Device(SN)
        </MenuItem>

        <MenuItem active={mode === "datalogger"} onClick={() => setMode("datalogger")}>
          Search Device(Datalogger)
        </MenuItem>

        <MenuItem active={mode === "user"} onClick={() => setMode("user")}>
          Search User
        </MenuItem>

        <MenuItem active={mode === "module"} onClick={() => setMode("module")}>
          Search Module
        </MenuItem>
      </aside>

      {/* ---------- CONTENT ---------- */}
      <section className="flex-1 px-4 sm:px-8 py-6 sm:py-8">

        {/* TITLE */}
        <h2 className="text-[16px] font-medium text-[rgba(0,0,0,0.85)] mb-6">
          {MODE_TITLE[mode]}
        </h2>

        {/* INPUT + BUTTON */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center max-w-xl">

          <input
            placeholder="Please enter keyword"
            className="
              w-full
              h-8
              px-2.75
              text-[14px]
              border border-[#d9d9d9]
              rounded-xs
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
              rounded-xs
              border border-[#1890ff]
              bg-[#1890ff]
              text-white
              hover:bg-[#40a9ff]
              hover:border-[#40a9ff]
              transition
              whitespace-nowrap
            "
          >
            SEARCH
          </button>

        </div>
      </section>
    </div>
  );
}

/* ---------- MENU ITEM ---------- */

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
        "relative whitespace-nowrap px-4 lg:px-6 py-3 text-[14px] transition text-left w-full",
        active
          ? "bg-[#e6f7ff] text-[#1890ff]"
          : "text-[rgba(0,0,0,0.65)] hover:bg-[#f5f5f5]"
      )}
    >
      {active && (
        <span className="absolute left-0 top-0 h-full w-0.75 bg-[#1890ff]" />
      )}
      {children}
    </button>
  );
}