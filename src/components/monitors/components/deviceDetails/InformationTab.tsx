"use client";

import { useSearchParams } from "next/navigation";
import {
  HiOutlineDownload,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi";
import { useDeviceInformationExport } from "@/hooks/api/useDevices";
import { useState } from "react";

export type Stat = {
  label: string;
  value: string;
  icon?: string;
};

type InfoProps = {
  basicStats: Stat[];
  stringStats: Stat[];
  deviceId: string;
  plantId: string;
  dateFrom: string;
  dateTo: string;
};

type SectionHeaderProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
};

const SectionHeader = ({ title, isOpen, onToggle }: SectionHeaderProps) => (
  <button
    onClick={onToggle}
    className="
      w-full
      flex
      items-center
      justify-between
      rounded-xl
      border
      border-gray-100
      bg-gray-50
      px-5
      py-3
      transition-all
      duration-300
      hover:bg-gray-100
      hover:border-gray-300
    "
  >
    <div className="flex items-center gap-3">
      <div className="h-6 w-1 rounded-full bg-blue-500"></div>

      <span className="text-base font-semibold text-blue-700">{title}</span>
    </div>

    <span className="text-blue-600 transition-transform duration-300">
      {isOpen ? (
        <HiChevronDown className="h-5 w-5" />
      ) : (
        <HiChevronRight className="h-5 w-5" />
      )}
    </span>
  </button>
);

const StatsGrid = ({ stats }: { stats: Stat[] }) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl border bg-white p-2 shadow-sm space-y-2 border-gray-200"
        >
          <p className="text-xs text-gray-400">{stat.label}</p>
          <p className="text-sm font-medium text-gray-800">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

const InformationTab = ({
  basicStats,
  stringStats,
  deviceId,
  plantId,
  dateFrom,
  dateTo,
}: InfoProps) => {
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("targetEndUserId");
  const [basicOpen, setBasicOpen] = useState(true);
  const [stringOpen, setStringOpen] = useState(true);
  const serviceParams = selectedEndUserId
    ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
    : {};
  const informationExportMutation = useDeviceInformationExport();

  const handleInformationExport = async () => {
    try {
      const csv = await informationExportMutation.mutateAsync({
        deviceId,
        params: {
          plantId,
          dateFrom,
          dateTo,
          format: "csv",
          ...serviceParams,
        },
      });

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `device-information-${dateFrom}-${dateTo}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Information export failed", error);
    }
  };
  return (
    <div className="space-y-8 mt-4">
      <div className="flex flex-wrap gap-2 items-center justify-end text-black">
        <button
          onClick={handleInformationExport}
          disabled={informationExportMutation.isPending}
          className="border rounded px-3 py-1.5 cursor-pointer transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <HiOutlineDownload className="inline h-5 w-5" />
            <p>
              {informationExportMutation.isPending
                ? "Downloading..."
                : "Download"}
            </p>
          </span>
        </button>
      </div>
      <div className="space-y-6">
        <SectionHeader
          title="Basic Information"
          isOpen={basicOpen}
          onToggle={() => setBasicOpen(!basicOpen)}
        />

        {basicOpen && (
          <div className="animate-fadeIn">
            <StatsGrid stats={basicStats} />
          </div>
        )}

        <SectionHeader
          title="String Information"
          isOpen={stringOpen}
          onToggle={() => setStringOpen(!stringOpen)}
        />

        {stringOpen && (
          <div className="animate-fadeIn">
            <StatsGrid stats={stringStats} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InformationTab;
