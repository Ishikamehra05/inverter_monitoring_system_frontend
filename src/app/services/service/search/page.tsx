"use client";

import { useState } from "react";
import clsx from "clsx";
import { useSearchDevice, useSearchUser } from "@/hooks/api/useUsers";
import Link from "next/link";
import { toast } from "sonner";
import DevicesTabPanel from "@/components/monitors/components/deviceDetails/DevicesTabPanel";
import {
  HiOutlineTrash,
  HiOutlineSwitchHorizontal,
  HiOutlineCog,
  HiOutlineUpload,
  HiOutlineTerminal,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { useDeleteDevice } from "@/hooks/api/useDevices";
import DeleteInverterModal from "@/components/monitors/modals/DeleteInverterModal";
import { useDeleteAccount } from "@/hooks/api/useService";

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
  const deleteAccountMutation = useDeleteAccount();
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const deleteDeviceServiceParams = {
    fromService: true,
    targetEndUserId: device?.userId ?? undefined,
  };
  const deleteDevice = useDeleteDevice(
    device?.plantId ?? "",
    deleteDeviceServiceParams,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
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

  const handleDeleteDevice = async () => {
    if (!device?.id || !device?.plantId) {
      toast.error("No device selected.");
      return;
    }

    try {
      await deleteDevice.mutateAsync(device.id);

      toast.success("Device deleted successfully.");

      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete device.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync({
        fromService: true,
      });

      toast.success("Account deleted successfully.");

      setDeleteAccountOpen(false);

      searchUser.reset();
      setKeyword("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete account.");
    }
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
sm:w-90 h-10 border border-[#d9d9d9] px-4 text-[14px] outline-none"
          />

          <button
            onClick={handleSearch}
            disabled={searchUser.isPending || searchDevice.isPending}
            className="h-10 w-full sm:w-27.5 bg-[#1890ff] text-white text-[13px] tracking-[2px] hover:bg-[#40a9ff]"
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
                    <td className="bg-[#f5f5f5] w-[24%] px-5 py-1">
                      Device SN
                    </td>

                    <td colSpan={3} className="px-4 py-1">
                      {device.sno}
                    </td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-1 text-sm">
                      Operation
                    </td>

                    <td colSpan={3} className="px-5 py-2">
                      <div className="flex flex-wrap items-center gap-3 text-[15x]">
                        <button className="flex items-center gap-1 hover:text-[#1890ff] transition-colors text-sm">
                          <HiOutlineSwitchHorizontal className="h-5 w-5" />
                          <span>Change Account</span>
                        </button>

                        <button
                          onClick={() => setDeleteOpen(true)}
                          disabled={deleteDevice.isPending}
                          className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                          <span>
                            {deleteDevice.isPending
                              ? "Deleting..."
                              : "Delete Device"}
                          </span>
                        </button>

                        <button className="flex items-center text-sm gap-1 hover:text-[#1890ff] transition-colors">
                          <HiOutlineUpload className="h-5 w-5" />
                          <span>Upgrade Device</span>
                        </button>
                        <button className="flex items-center text-sm gap-1 hover:text-[#1890ff] transition-colors">
                          <HiOutlineCog className="h-5 w-5" />
                          <span>Remote Setting</span>
                        </button>
                        <button className="flex items-center text-sm gap-1 hover:text-[#1890ff] transition-colors">
                          <HiOutlineTerminal className="h-5 w-5" />
                          <span>Command Operation</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5]  text-sm px-5 py-1">Status</td>

                    <td className="px-4 text-sm py-1">{device.status}</td>

                    <td className="bg-[#f5f5f5] text-sm px-5 py-1">Account</td>

                    <td className="px-4 py-1 text-sm">
                      <Link
                        href={`/monitor/plants?userid=${device.id}&fromService=true`}
                        className="text-[#1890ff] hover:underline"
                      >
                        {device.account}
                      </Link>
                    </td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-1 text-sm">
                      Model
                    </td>

                    <td className="px-4 py-1 text-sm">
                      {device.inverterName ?? "--"}
                    </td>

                    <td className="bg-[#f5f5f5]  text-sm px-5 py-1">Power</td>

                    <td className="px-4 py-1 text-sm">
                      {device.currentPower ?? 0} kW
                    </td>
                  </tr>

                  <tr className="border-b text-sm border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-1">Update Time</td>

                    <td className="px-4 text-sm py-1">
                      {new Date(device.latestTimestamp).toLocaleString()}
                    </td>

                    <td className="bg-[#f5f5f5] text-sm px-5 py-1">E-Today</td>

                    <td className="px-4 text-sm py-1">
                      {device.dailyProduction ?? 0} kWh
                    </td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] text-sm px-5 py-1">E-Total</td>

                    <td className="px-4 text-sm py-1">
                      {device.totalEnergy ?? 0} kWh
                    </td>

                    <td className="bg-[#f5f5f5]  text-sm px-5 py-1">
                      Communication Module SN
                    </td>

                    <td className="px-4 py-1">
                      {device.communicationModuleSn ?? "--"}
                    </td>
                  </tr>

                  <tr className="border-b border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5 py-1 text-sm ">
                      Communication Module Version
                    </td>

                    <td className="px-4 py-1">
                      {device.communicationModuleVersion ?? "--"}
                    </td>

                    <td className="bg-[#f5f5f5]  text-sm px-5 py-1">
                      Communication Status
                    </td>

                    <td className="px-4 py-1">
                      {device.communicationStatus ?? "--"}
                    </td>
                  </tr>

                  <tr className="border-b text-sm border-[#ececec]">
                    <td className="bg-[#f5f5f5] px-5  text-sm py-1">MDSP</td>

                    <td className="px-4 py-1">--</td>

                    <td className="bg-[#f5f5f5] text-sm px-5 py-1">SDSP</td>

                    <td className="px-4 py-1">--</td>
                  </tr>

                  <tr>
                    <td className="bg-[#f5f5f5]  text-sm px-5 py-1">CSB</td>

                    <td colSpan={3} className="px-4 py-1">
                      --
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <DeleteInverterModal
              open={deleteOpen}
              device={{
                id: device.id,
                name: device.sno,
              }}
              loading={deleteDevice.isPending}
              onClose={() => setDeleteOpen(false)}
              onConfirm={handleDeleteDevice}
            />
            {/* <div className="mt-10">
              <h3 className="text-[18px] font-semibold text-[#333] mb-5">
                Device Details
              </h3>
              <DevicesTabPanel
                plantId={device.plantId || ""}
                deviceId={device.id || ""}
                fromService={true}
                className="!pt-0 !px-0 border border-[#ececec]"
              />
            </div> */}
          </>
        )}
        {mode === "user" && (
          <>
            {/* User Info */}
            {user && (
              <>
                <h3 className="text-[18px] font-semibold text-[#222] mb-4">
                  User Info
                </h3>

                <table className="w-full border border-[#ededed] border-collapse text-[15px]">
                  <tbody>
                    <tr className="border-b border-[#ededed]">
                      <td className="bg-[#f7f7f7] w-[30%] px-5 py-2 text-[#555]">
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
                      <td className="bg-[#f7f7f7] px-5 py-2 font-medium">
                        Operation
                      </td>

                      <td colSpan={3} className="px-5 py-2">
                        <div className="flex items-center flex-wrap gap-4 text-[15px]">
                          {/* Activate User */}
                          <button className="flex items-center gap-1 text-[#555] hover:text-green-600 transition-colors">
                            <HiOutlineCheckCircle className="h-5 w-5" />
                            <span>Activate User</span>
                          </button>

                          <span className="text-gray-300">|</span>

                          {/* Delete Account */}
                          <button
                            onClick={() => setDeleteAccountOpen(true)}
                            disabled={deleteAccountMutation.isPending}
                            className="flex items-center gap-1 text-[#555] hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                            <span>
                              {deleteAccountMutation.isPending
                                ? "Deleting..."
                                : "Delete Account"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <DeleteInverterModal
                      open={deleteAccountOpen}
                      device={
                        user
                          ? {
                            id: user.id,
                            name: user.account,
                          }
                          : null
                      }
                      loading={deleteAccountMutation.isPending}
                      onClose={() => setDeleteAccountOpen(false)}
                      onConfirm={handleDeleteAccount}
                    />
                    <tr className="border-b border-[#ededed]">
                      <td className="bg-[#f7f7f7] px-5 py-4">E-mail</td>

                      <td className="px-5 py-2">{user.email ?? "-"}</td>

                      <td className="bg-[#f7f7f7] w-[140px] px-5 py-2">
                        Phone
                      </td>

                      <td className="px-5 py-2">{user.phone ?? "-"}</td>
                    </tr>

                    <tr className="border-b border-[#ededed]">
                      <td className="bg-[#f7f7f7] px-5 py-2">
                        Registration Time
                      </td>

                      <td className="px-5 py-2">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>

                      <td className="bg-[#f7f7f7] px-5 py-2">Price</td>

                      <td className="px-5 py-2">0.0000</td>
                    </tr>

                    <tr>
                      <td className="bg-[#f7f7f7] px-5 py-2">Activation</td>

                      <td colSpan={3} className="px-5 py-2">
                        {user.status === "active" ? "Y" : "N"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
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
