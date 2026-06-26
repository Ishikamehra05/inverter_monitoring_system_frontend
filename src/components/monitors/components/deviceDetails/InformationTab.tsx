"use client";

import { useSearchParams } from "next/navigation";
import { HiOutlineDownload } from "react-icons/hi";
import { useDeviceInformationExport } from "@/hooks/api/useDevices";

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

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2">
    <span className="w-1 h-6 bg-blue-500 rounded"></span>
    <h2 className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded">
      {title}
    </h2>
  </div>
);

const StatsGrid = ({ stats }: { stats: Stat[] }) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl border bg-white p-4 shadow-sm space-y-2"
        >
          <p className="text-xs text-gray-400">{stat.label}</p>
          <p className="text-sm font-medium text-gray-700">{stat.value}</p>
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

  const serviceParams =
    selectedEndUserId
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
      <div className="space-y-8 mt-4">
        <SectionHeader title="Basic Info" />
        <StatsGrid stats={basicStats} />
        <SectionHeader title="String Info" />
        <StatsGrid stats={stringStats} />
      </div>
    </div>
  );
};

export default InformationTab;
