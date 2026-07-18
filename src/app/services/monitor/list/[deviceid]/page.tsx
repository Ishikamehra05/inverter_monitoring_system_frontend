// services/monitor/[groupId]/[deviceId]/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Settings, RefreshCw, Info } from "lucide-react";
import RemoteSettingModal from "@/components/services/modals/RemoteSettingModal";
import UpgradeInfoModal from "@/components/services/modals/UpgradeInfoModal";
import DeviceListSidePanel from "@/components/services/sidePanels/deviceListSidePanel";
import OperationPopover from "@/components/services/Operationpopover";
import { useSearchParams } from "next/navigation";
import { usePlantDevices, useDeviceInformation } from "@/hooks/api/useDevices";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Device {
  id: number | string;
  name: string;
  statusImg: string;
  deviceName: string;
  sn: string;
  power: number;
  eToday: number;
  eTotal: number;
  updateTime: string;
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  order,
  onSort,
  extra,
}: {
  label: string;
  sortKey: string;
  currentKey: string | null;
  order: "asc" | "desc";
  onSort: (k: string) => void;
  extra?: React.ReactNode;
}) {
  const isActive = currentKey === sortKey;
  const nextOrder = !isActive ? "asc" : order === "asc" ? "desc" : "asc";
  const tooltipText =
    nextOrder === "asc"
      ? "Click to sort ascending"
      : "Click to sort descending";

  return (
    <th className="px-4 py-3 text-left font-medium text-[#000000D9] overflow-visible">
      <button
        onClick={() => onSort(sortKey)}
        className="relative flex items-center gap-1 text-sm font-medium focus:outline-none group cursor-pointer whitespace-nowrap"
      >
        {label}
        {extra}
        <div className="flex flex-col text-[10px] leading-none ml-1">
          <span
            className={
              isActive && order === "asc" ? "text-[#1677ff]" : "text-[#bfbfbf]"
            }
          >
            ▲
          </span>
          <span
            className={
              isActive && order === "desc" ? "text-[#1677ff]" : "text-[#bfbfbf]"
            }
          >
            ▼
          </span>
        </div>
        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#595959] text-white text-xs px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none shadow-lg">
          {tooltipText}
          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#595959] rotate-45" />
        </div>
      </button>
    </th>
  );
}

function StatusIcon() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
      <circle
        cx="20"
        cy="20"
        r="19"
        stroke="#d9d9d9"
        strokeWidth="1.5"
        fill="white"
      />
      {/* Wifi-style arcs, grayed out for offline */}
      <path
        d="M13 24 Q20 14 27 24"
        stroke="#bfbfbf"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M16 27 Q20 21 24 27"
        stroke="#bfbfbf"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="20" cy="29" r="1.5" fill="#bfbfbf" />
      {/* Small cloud-like shape at top */}
      <path
        d="M15 20 Q17 16 20 17 Q22 14 25 16 Q27 17 26 20"
        stroke="#bfbfbf"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DeviceListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plantId = searchParams.get("plantId") ?? "";
  const targetEndUserId = searchParams.get("userid") ?? "";

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarDevice, setSidebarDevice] = useState<Device | null>(null);
  const [remoteOpen, setRemoteOpen] = useState(false);
  const [remoteDevice, setRemoteDevice] = useState<Device | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeDevice, setUpgradeDevice] = useState<Device | null>(null);

  const devicesQuery = usePlantDevices(plantId, {
    page: currentPage,
    pageSize: 10,
    fromService: true,
    targetEndUserId,
  });

  const normalizedDeviceId =
    typeof sidebarDevice?.id === "string"
      ? sidebarDevice.id.replace("device-", "")
      : String(sidebarDevice?.id ?? "");

  const informationQuery = useDeviceInformation(normalizedDeviceId, plantId, {
    fromService: true,
    targetEndUserId,
  });
  const information = informationQuery.data;

  const normalizeStatValue = (value: string) =>
    value
      .replace(/째C/g, "°C")
      .replace(/째/g, "°")
      .replace(/℃/g, "°C")
      .replace(/˚C/g, "°C");

  const basicStats =
    information?.basicStats?.map((item) => ({
      label: item.label,
      value: normalizeStatValue(item.value),
    })) ?? [];
  const stringStats =
    information?.stringStats?.map((item) => ({
      label: item.label,
      value: normalizeStatValue(item.value),
    })) ?? [];

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const devices = devicesQuery.data?.items ?? [];

  const sortedDevices = useMemo(() => {
    if (!sortKey) return devices;

    return [...devices].sort((a, b) => {
      const aVal = a[sortKey as keyof typeof a];
      const bVal = b[sortKey as keyof typeof b];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [devices, sortKey, sortOrder]);

  const totalItems = devicesQuery.data?.pagination.totalItems ?? 0;
  const totalPages = devicesQuery.data?.pagination.totalPages ?? 1;

  if (devicesQuery.isLoading) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-lg border p-6">
          Loading devices...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 overflow-x-auto overflow-y-visible">
        <div className="mb-4">
          <span
            onClick={() => router.back()}
            className="inline-flex items-center text-[#1890FF] cursor-pointer hover:underline text-base font-medium"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </span>
        </div>
        {/* Title row */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-base font-semibold text-[#000000D9]">
            Device List
          </h1>
          <button
            className="text-gray-400 hover:text-[#1890FF] transition-colors"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Table */}
        <div
          className="border border-[#f0f0f0] rounded-lg"
          style={{ overflow: "visible" }}
        >
          <table
            className="min-w-full text-sm"
            style={{ borderCollapse: "collapse" }}
          >
            <thead className="bg-gray-50">
              <tr className="border-b border-[#f0f0f0]">
                <th className="px-4 py-3 text-left font-medium text-[#000000D9] text-sm">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#000000D9] text-sm">
                  Device Name
                </th>
                <SortableHeader
                  label="Power"
                  sortKey="power"
                  currentKey={sortKey}
                  order={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="E-Today"
                  sortKey="eToday"
                  currentKey={sortKey}
                  order={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="E-Total"
                  sortKey="eTotal"
                  currentKey={sortKey}
                  order={sortOrder}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-left font-medium text-[#000000D9] text-sm">
                  UpdateTime
                </th>
                {/* Operation header — hover the ⓘ to see the popover */}
                <th className="px-4 py-3 text-left font-medium text-[#000000D9] text-sm overflow-visible">
                  <div className="flex items-center gap-1">
                    <span>Operation</span>
                    {/* <OperationPopover
                      onRemoteSetting={() => {
                        setRemoteDevice();
                        setRemoteOpen(true);
                      }}
                      onBurn={() => {
                        setUpgradeDevice(MOCK_DEVICES[0]);
                        setUpgradeOpen(true);
                      }}
                      onAlarmPush={() => {

                      }}
                    >
                      <Info size={13} className="text-gray-400 cursor-pointer" />
                    </OperationPopover> */}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedDevices.map((device: any) => (
                <tr
                  key={device.id}
                  className="border-b border-[#f0f0f0] last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        device.status === "online"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                  </td>

                  {/* Device Name */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        setSidebarDevice(device);
                        setSidebarOpen(true);
                      }}
                      className="text-[#1890FF] hover:underline whitespace-nowrap text-left"
                    >
                      {device.name}
                    </button>
                  </td>

                  {/* Power */}
                  <td className="px-4 py-4">
                    {device.power?.value?.toFixed(2)} {device.power?.unit}
                  </td>

                  <td className="px-4 py-4">
                    {device.today?.value?.toFixed(2)} {device.today?.unit}
                  </td>

                  <td className="px-4 py-4">
                    {device.total?.value?.toFixed(2)} {device.total?.unit}
                  </td>

                  {/* Update Time */}
                  <td className="px-4 py-4 text-[#000000D9] whitespace-nowrap">
                    {device.updatedAt}
                  </td>

                  {/* Operation */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setRemoteDevice(device);
                          setRemoteOpen(true);
                        }}
                        title="Remote Setting"
                      >
                        <Settings
                          size={18}
                          className="text-[#595959] hover:text-[#1890FF] transition-colors cursor-pointer"
                        />
                      </button>
                      <button
                        onClick={() => {
                          setUpgradeDevice(device);
                          setUpgradeOpen(true);
                        }}
                        title="Upgrade"
                      >
                        <UploadIcon className="text-[#1890FF] hover:text-[#40a9ff] transition-colors cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-end mt-4 gap-3 text-sm text-[#000000D9]">
          <span>
            {totalItems === 0
              ? "0 items"
              : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  totalItems,
                )} of ${totalItems} items`}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#d9d9d9] bg-white text-gray-500 hover:border-[#1890FF] hover:text-[#1890FF] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          <span className="px-2 text-[#1890FF] font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#d9d9d9] bg-white text-gray-500 hover:border-[#1890FF] hover:text-[#1890FF] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>

      {/* Device info sidebar */}
      <DeviceListSidePanel
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        deviceName={sidebarDevice?.name}
        deviceId={normalizedDeviceId}
        plantId={plantId}
        targetEndUserId={targetEndUserId}
        basicStats={basicStats}
        stringStats={stringStats}
        loading={informationQuery.isLoading}
      />

      {/* Remote Setting modal */}
      <RemoteSettingModal
        isOpen={remoteOpen}
        onClose={() => setRemoteOpen(false)}
        deviceId={remoteDevice ? String(remoteDevice.id) : ""}
        plantId={plantId}
        sn={remoteDevice?.sn}
        targetEndUserId={targetEndUserId}
      />

      {/* Upgrade Info modal */}
      <UpgradeInfoModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        model={sidebarDevice?.deviceName?.split(" ")[0]}
        sn={upgradeDevice?.sn}
        mdsp="311802"
        sdsp="310601"
        csb="010607"
        status="DONE"
      />
    </div>
  );
}
