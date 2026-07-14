"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DateRange } from "react-date-range";
import { Download } from "lucide-react";
import { Pagination } from "@/components/monitors/pagination";
import { useUserLogs } from "@/hooks/api/usePlants";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


type DateRangeSelection = {
  selection: {
    startDate: Date;
    endDate: Date;
    key: string;
  };
};

type Log = {
  id: string;
  name: string;
  account: string;
  type: string;
  sn: string;
  time: string;
  status: string;
  event: string;
};

const LogsTable = ({ logs }: { logs: Log[] }) => {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full bg-white text-md">
        <thead className="bg-gray-50 text-black">
          <tr className="whitespace-nowrap">
            <th className="px-3 py-4 text-left">Name</th>
            <th className="px-3 py-4 text-left">Account</th>
            <th className="px-3 py-4 text-left">Type</th>
            <th className="px-3 py-4 text-left">S/N</th>
            <th className="px-3 py-4 text-left">Time</th>
            <th className="px-3 py-4 text-left">Status</th>
            <th className="px-3 py-4 text-left">Event</th>
          </tr>
        </thead>

        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                No logs found
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr
                key={log.id}
                className="border-t border-gray-300 whitespace-nowrap text-black"
              >
                <td className="p-3">{log.name}</td>
                <td className="p-3">{log.account}</td>
                <td className="p-3">{log.type}</td>
                <td className="p-3">{log.sn}</td>
                <td className="p-3">{log.time}</td>
                <td className="p-3 text-blue-700">{log.status}</td>
                <td className="p-3">
                  {log.event && (
                    <span className="rounded bg-blue-500 px-2 py-1 text-white text-xs">
                      {log.event}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function LogsPage() {
  const searchParams = useSearchParams();

  const selectedEndUserId =
    searchParams.get("userid") ?? undefined;
  const serviceParams =
    selectedEndUserId
      ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
      : {};
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showCalendar, setShowCalendar] = useState(false);

  const [range, setRange] = useState<
    DateRangeSelection["selection"][]
  >(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    return [
      {
        startDate: sevenDaysAgo,
        endDate: today,
        key: "selection",
      },
    ];
  });

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const { data, isLoading } = useUserLogs({
    page: currentPage,
    pageSize,
    search,
    event: eventFilter,
    dateFrom: formatDate(range[0].startDate),
    dateTo: formatDate(range[0].endDate),
    ...serviceParams,
  });

  const logs = data?.items ?? [];

  const downloadCSV = () => {
    const headers =
      "Name,Account,Type,SN,Time,Status,Event\n";

    const rows = logs
      .map(
        (l) =>
          `${l.name},${l.account},${l.type},${l.sn},${l.time},${l.status},${l.event}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "logs.csv";
    a.click();
  };

  return (
    <div className="p-6">
      <div className="rounded-lg bg-white p-4 shadow space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-2 text-black">
          <input
            placeholder="Search name, account, SN"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-1.5"
          />

          <div className="relative">
            <input
              readOnly
              onClick={() =>
                setShowCalendar(!showCalendar)
              }
              value={`${range[0].startDate.toLocaleDateString()} — ${range[0].endDate.toLocaleDateString()}`}
              className="border rounded px-3 py-1.5 cursor-pointer"
            />

            {showCalendar && (
              <div className="absolute right-0 z-20 mt-2 rounded border bg-white shadow-lg">
                <DateRange
                  ranges={range}
                  onChange={(ranges: DateRangeSelection) => {
                    setRange([ranges.selection]);
                    setCurrentPage(1);
                  }}
                />

                <div className="flex justify-end p-2">
                  <button
                    onClick={() =>
                      setShowCalendar(false)
                    }
                    className="rounded bg-blue-500 px-3 py-1 text-white"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* <select
            value={eventFilter}
            onChange={(e) => {
              setEventFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-1.5"
          >
            <option value="All">All</option>
          </select> */}

          <button
            onClick={downloadCSV}
            className="rounded bg-blue-500 px-3 py-1.5 text-white"
          >
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center">
            Loading...
          </div>
        ) : (
          <LogsTable logs={logs} />
        )}

        <Pagination
          totalItems={
            data?.pagination.totalItems ?? 0
          }
          pageSize={
            data?.pagination.pageSize ?? pageSize
          }
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
}