"use client";

import { useMonitorUsersExport } from "@/hooks/api/useService";
import { MonitorFilters } from "@/lib/api/schemas/service";
import { Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Props {
  filters: MonitorFilters;
  setFilters: React.Dispatch<React.SetStateAction<MonitorFilters>>;
  onQuery: () => void;
  onReset: () => void;
}
export default function MonitorHeader({
  filters,
  setFilters,
  onQuery,
  onReset,
}: Props) {
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("userid") ?? undefined;

  const serviceParams = selectedEndUserId
    ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
    : undefined;
  const exportMonitorUsers = useMonitorUsersExport();
  const { isPending } = exportMonitorUsers;

  const handleExport = async () => {
    try {
      const csv = await exportMonitorUsers.mutateAsync(serviceParams);

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "monitor-users.csv";
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search User */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Search User :
          </label>
          <input
            type="text"
            value={filters.searchUser}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                searchUser: e.target.value,
              }))
            }
            placeholder="Please enter"
            className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
          />
        </div>

        {/* Search SN */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Search SN :
          </label>
          <input
            type="text"
            value={filters.searchSN}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                searchSN: e.target.value,
              }))
            }
            placeholder="Please enter"
            className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
          />
        </div>

        {/* Search Installation Date */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Search Installation date :
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.searchInstallationDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  searchInstallationDate: e.target.value,
                }))
              }
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
            />
            <Calendar
              size={16}
              className="absolute right-3 top-3 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Search By Affiliation */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Search By Affiliation :
          </label>
          <input
            value={filters.searchAffiliation}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                searchAffiliation: e.target.value,
              }))
            }
            className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
          ></input>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        {/* Reset Button */}
        <button
          onClick={onReset}
          className="h-10 px-5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          Reset
        </button>

        {/* Query Button */}
        <button
          className="
            h-10 px-6 rounded-md
            text-white
            border border-[#1890ff]
            bg-[#1890ff]
            shadow-[0_2px_0_rgba(0,0,0,0.045)]
            hover:bg-[#40a9ff]
            hover:border-[#40a9ff]
            transition
          "
          style={{ textShadow: "0 -1px 0 rgba(0,0,0,.12)" }}
          onClick={onQuery}
        >
          Query
        </button>

        {/* Download Button */}
        <button
          onClick={handleExport}
          disabled={isPending}
          className="
            h-10 px-6 rounded-md
            text-white
            border border-[#1890ff]
            bg-[#1890ff]
            shadow-[0_2px_0_rgba(0,0,0,0.045)]
            hover:bg-[#40a9ff]
            hover:border-[#40a9ff]
            transition
          "
          style={{ textShadow: "0 -1px 0 rgba(0,0,0,.12)" }}
        >
          {isPending ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
  );
}
