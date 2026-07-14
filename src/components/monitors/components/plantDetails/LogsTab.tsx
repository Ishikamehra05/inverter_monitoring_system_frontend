"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/monitors/pagination";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Download } from "lucide-react";
import { usePlantLogs, usePlantLogsExport } from "@/hooks/api/usePlants";

export type Log = {
  id: number;
  name: string;
  type: string;
  sn: string;
  time: string;
  status: string;
  event: string;
};

type LogsTableProps = {
  logs: Log[];
};


const LogsTable = ({ logs }: LogsTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-md">
        <thead className="bg-gray-50 text-black">
          <tr className="whitespace-nowrap">
            <th className="px-3 py-4 text-left">Name</th>

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
              <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                No logs found
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr
                key={log.id}
                className="border-t border-gray-300 text-black hover:bg-gray-50 whitespace-nowrap transition"
              >
                <td className="p-3">{log.name}</td>

                <td className="p-3">{log.type}</td>
                <td className="p-3">{log.sn}</td>
                <td className="p-3">{log.time}</td>
                <td className="p-3 text-blue-700">{log.status}</td>
                <td className="p-3">
                  <span className="inline-flex rounded-sm bg-blue-500 px-2 py-1 text-sm text-white">
                    {log.event}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

type DateRangeSelection = {
  selection: {
    startDate: Date;
    endDate: Date;
    key: string;
  };
};
type LogsTabProps = {
  plantId: string;
};

const LogsTab = ({ plantId }: LogsTabProps) => {
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("targetEndUserId");

  const serviceParams =
    selectedEndUserId
      ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
      : {};
  // const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showCalendar, setShowCalendar] = useState(false);
  const today = new Date();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [range, setRange] = useState<DateRangeSelection["selection"][]>([
    {
      startDate: sevenDaysAgo,
      endDate: today,
      key: "selection",
    },
  ]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const logsQuery = usePlantLogs(plantId, {
    page: currentPage,
    pageSize,
    event: eventFilter,
    dateFrom: formatDate(range[0].startDate),
    dateTo: formatDate(range[0].endDate),
    ...serviceParams,
  });

  const exportLogsMutation = usePlantLogsExport();

  const logs: Log[] =
    logsQuery.data?.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      sn: item.sn,
      time: item.time,
      status: item.status ?? "Inactive",
      event: item.event ?? "Inactive",
    })) ?? [];

  const handleDownload = async () => {
    try {
      const response = await exportLogsMutation.mutateAsync({
        plantId,
        params: {
          event: eventFilter,
          dateFrom: formatDate(range[0].startDate),
          dateTo: formatDate(range[0].endDate),
          format: "csv",
          ...serviceParams,
        },
      });
      // console.log("export response", response);


      const csv = response;

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "plant-logs.csv";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export logs", error);
    }
  };

  return (

    <div className="p-6 space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-end text-black">
        {/* Date */}
        <div className="relative">
          <input
            readOnly
            onClick={() => setShowCalendar(!showCalendar)}
            value={`${range[0].startDate.toLocaleDateString()} — ${range[0].endDate.toLocaleDateString()}`}
            className="border rounded px-3 py-1.5 cursor-pointer"
          />

          {showCalendar && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded z-20">
              <DateRange
                ranges={range}
                onChange={(ranges: DateRangeSelection) =>
                  setRange([ranges.selection])
                }
              />
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Event Filter */}
        {/* <select
          value={eventFilter}
          onChange={(e) => {
            setEventFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-3 py-1.5"
        >
          <option>All</option>
          <option>Grid under voltage</option>
          <option>Grid under frequency</option>
        </select> */}

        {/* Download */}
        <button
          onClick={handleDownload}
          className="border rounded px-3 py-1.5 bg-blue-500 text-white"
        >
          <span className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <p>Download</p>
          </span>
        </button>

      </div>

      {/* Table */}
      <LogsTable logs={logs} />

      <Pagination
        totalItems={logsQuery.data?.pagination?.totalItems ?? 0}
        pageSize={pageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default LogsTab;
