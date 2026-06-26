import { useState } from "react";
import { Pagination } from "../pagination";
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
    
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
    
      const paginatedLogs = logs.slice(startIndex, endIndex);

  return (
    <div className="mt-4 space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-end">
        <input type="date" className="border rounded px-2 py-1 text-sm" />
        <span>—</span>
        <input type="date" className="border rounded px-2 py-1 text-sm" />
        <select className="border rounded px-2 py-1 text-sm">
          <option>All</option>
          <option>Grid under voltage</option>
          <option>Grid under frequency</option>
        </select>
        <button className="px-3 py-1 text-sm rounded bg-blue-600 text-white">
          🔍 Search
        </button>
        <button className="px-3 py-1 text-sm rounded bg-gray-100">
          ⬇ Download
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
