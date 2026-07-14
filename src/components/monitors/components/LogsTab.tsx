import { useState } from "react";
import { Pagination } from "../pagination";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
          <tr>
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
                className="border-t border-gray-300 text-black hover:bg-gray-50 transition"
              >
                <td className="p-3 max-w-52 wrap-break-word">{log.name}</td>
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

const LogsTab = ({ logs }: { logs: Log[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showCalendar, setShowCalendar] = useState(false);

  type DateRangeSelection = {
    selection: {
      startDate: Date;
      endDate: Date;
      key: string;
    };
  };

  const [range, setRange] = useState<DateRangeSelection["selection"][]>(() => {
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

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedLogs = logs.slice(startIndex, endIndex);

  return (
    <div className="mt-4 space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-end text-black">
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

        <button className="px-3 py-1.5 rounded bg-blue-600 text-white">
          Search
        </button>

        <button className="px-3 py-1.5 rounded bg-gray-100">
          Download
        </button>
      </div>

      {/* Table */}
      <LogsTable logs={paginatedLogs} />
      <Pagination
        totalItems={logs.length}
        pageSize={pageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default LogsTab;
