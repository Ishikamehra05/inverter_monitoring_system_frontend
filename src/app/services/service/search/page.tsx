"use client";

import { useState } from "react";
import clsx from "clsx";
import { useSearchDevice, useSearchUser } from "@/hooks/api/useUsers";
import Link from "next/link";
import { toast } from "sonner";

type Mode = "sn" | "datalogger" | "user" | "module";

const MODE_TITLE: Record<Mode, string> = {
  sn: "Search Device(SN)",
  datalogger: "Search Device(Datalogger)",
  user: "Search User",
  module: "Search Module",
};

export default function GlobalSearchPage() {
  const [mode, setMode] = useState<Mode>("sn");
  const [keyword, setKeyword] = useState("");
  const searchUser = useSearchUser();
  const user = searchUser.data?.user;
  const searchDevice = useSearchDevice();
  const device = searchDevice.data?.device;
  const handleSearch = () => {
    const value = keyword.trim();

    if (!value) {
      toast.error(
        mode === "user"
          ? "Please enter account."
          : "Please enter Serial Number.",
      );
      return;
    }

    if (mode === "user") {
      searchUser.mutate(
        { account: value },
        {
          onError: (error: Error) => {
            toast.error(error.message || "User not found.");
          },
        },
      );
      return;
    }

    if (mode === "sn") {
      searchDevice.mutate(
        { sno: value },
        {
          onError: (error: Error) => {
            toast.error(error.message || "Device not found.");
          },
        },
      );
    }
  };
  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setKeyword("");
    searchUser.reset();
    searchDevice.reset();
  };
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-xs flex flex-col lg:flex-row min-h-105 w-full">
      {/* ---------- LEFT MENU ---------- */}
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[rgba(0,0,0,0.06)] flex lg:flex-col overflow-x-auto">
        <MenuItem active={mode === "sn"} onClick={() => changeMode("sn")}>
          Search Device(SN)
        </MenuItem>

        {/* <MenuItem active={mode === "datalogger"} onClick={() => setMode("datalogger")}>
          Search Device(Datalogger)
        </MenuItem> */}

        <MenuItem active={mode === "user"} onClick={() => changeMode("user")}>
          Search User
        </MenuItem>

        <MenuItem
          active={mode === "module"}
          onClick={() => changeMode("module")}
        >
          Search Module
        </MenuItem>
      </aside>

      {/* ---------- CONTENT ---------- */}
      <section className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <h2 className="text-[18px] font-semibold text-[#333] mb-8">
          {MODE_TITLE[mode]}
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder={
              mode === "user"
                ? "Please enter account"
                : "Please enter Serial Number"
            }
            className="w-full
sm:w-[360px] h-10 border border-[#d9d9d9] px-4 text-[14px] outline-none"
          />

          <button
            onClick={handleSearch}
            disabled={searchUser.isPending || searchDevice.isPending}
            className="h-10 w-full sm:w-[110px] bg-[#1890ff] text-white text-[13px] tracking-[2px] hover:bg-[#40a9ff]"
          >
            SEARCH
          </button>
        </div>
        {mode === "sn" && device && (
          <>
            <h3 className="text-[18px] font-semibold text-[#333] mb-5">
              Device Info
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-[#ececec] border-collapse text-[15px]">
                <tbody>
                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] w-[24%] px-5 py-3">
                      Device SN
                    </td>

                    <td colSpan={3} className="px-4 py-3">
                      {device.sno}
                    </td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-3">Operation</td>

                    <td colSpan={3} className="px-4 py-3 text-[#666]">
                      --
                    </td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-3">Inverter Status</td>

                    <td className="px-4 py-3">--</td>

                    <td className="bg-[#f5f5f5] px-5 py-3">Account</td>

                    <td className="px-4 py-3">--</td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-3">Model</td>

                    <td className="px-4 py-3">{device.inverterName ?? "--"}</td>

                    <td className="bg-[#f5f5f5] px-5 py-3">Power</td>

                    <td className="px-4 py-3">{device.currentPower ?? 0} W</td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-3">Update Time</td>

                    <td className="px-4 py-3">
                      {new Date(device.latestTimestamp).toLocaleString()}
                    </td>

                    <td className="bg-[#f5f5f5] px-5 py-3">E-Today</td>

                    <td className="px-4 py-3">
                      {device.dailyProduction ?? 0} kWh
                    </td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-3">E-Total</td>

                    <td className="px-4 py-3">{device.totalEnergy ?? 0} kWh</td>

                    <td className="bg-[#f5f5f5] px-5 py-3">
                      Communication Module SN
                    </td>

                    <td className="px-4 py-3">--</td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-3">
                      Communication Module Version
                    </td>

                    <td className="px-4 py-3">--</td>

                    <td className="bg-[#f5f5f5] px-5 py-3">
                      Communication Status
                    </td>

                    <td className="px-4 py-3">--</td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-3">MDSP</td>

                    <td className="px-4 py-3">--</td>

                    <td className="bg-[#f5f5f5] px-5 py-3">SDSP</td>

                    <td className="px-4 py-3">--</td>
                  </tr>

                  <tr>
                    <td className="bg-[#f5f5f5] px-5 py-3">CSB</td>

                    <td colSpan={3} className="px-4 py-3">
                      --
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
        {mode === "user" && (
          <>
            {/* User Info */}
            <h3 className="text-[18px] font-semibold text-[#222] mb-4">
              User Info
            </h3>

            {user && (
              <table className="w-full border border-[#ededed] border-collapse text-[15px]">
                <tbody>
                  <tr className="border-b border-[#ededed]">
                    <td className="bg-[#f7f7f7] w-[30%] px-5 py-4 text-[#555]">
                      Monitor User Name
                    </td>

                    <td colSpan={3} className="px-5 py-4">
                      <Link
                        href={`/monitor/plants?userid=${user.id}&fromService=true`}
                        className="text-[#1890ff] hover:underline"
                      >
                        {user.account}
                      </Link>
                    </td>
                  </tr>

                  <tr className="border-b border-[#ededed]">
                    <td className="bg-[#f7f7f7] px-5 py-4">Operation</td>

                    <td colSpan={3} className="px-5 py-4">
                      <button className="text-[#555] hover:text-[#1890ff]">
                        Activate User
                      </button>

                      <button className="ml-5 text-[#555] hover:text-red-500">
                        Delete User
                      </button>
                    </td>
                  </tr>

                  <tr className="border-b border-[#ededed]">
                    <td className="bg-[#f7f7f7] px-5 py-4">E-mail</td>

                    <td className="px-5 py-4">{user.email ?? "-"}</td>

                    <td className="bg-[#f7f7f7] w-[140px] px-5 py-4">Phone</td>

                    <td className="px-5 py-4">{user.phone ?? "-"}</td>
                  </tr>

                  <tr className="border-b border-[#ededed]">
                    <td className="bg-[#f7f7f7] px-5 py-4">
                      Registration Time
                    </td>

                    <td className="px-5 py-4">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>

                    <td className="bg-[#f7f7f7] px-5 py-4">Price</td>

                    <td className="px-5 py-4">0.0000</td>
                  </tr>

                  <tr>
                    <td className="bg-[#f7f7f7] px-5 py-4">Activation</td>

                    <td colSpan={3} className="px-5 py-4">
                      {user.status === "active" ? "Y" : "N"}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        )}
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
        "relative h-[52px] w-full px-6 text-left text-[15px]",
        active
          ? "bg-[#e6f7ff] text-[#1890ff]"
          : "text-[#444] hover:bg-[#fafafa]",
      )}
    >
      {active && (
        <span className="absolute left-0 top-0 h-full w-[3px] bg-[#1890ff]" />
      )}

      {children}
    </button>
  );
}
