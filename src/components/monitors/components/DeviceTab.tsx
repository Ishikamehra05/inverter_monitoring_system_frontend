"use client";

import { useState } from "react";
import { Pagination } from "../pagination";
import { useRouter } from "next/navigation";

// ---------- Types ----------
export type Device = {
  id: number;
  name: string;
  type: string;
  sn: string;
  power: number;
  today: number;
  total: number;
  hours: number;
  online: boolean;
};

type SortKey = keyof Pick<
  Device,
  "name" | "type" | "sn" | "power" | "today" | "total" | "hours"
>;

type SortOrder = "asc" | "desc";

// ---------- Device Table ----------
const DeviceTable = ({ devices }: { devices: Device[] }) => {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedDevices = [...devices].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const SortIcon = ({ column }: { column: SortKey }) =>
    sortKey === column ? (
      <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
    ) : (
      <span className="ml-1 text-gray-300">▲</span>
    );
 const router = useRouter();

  // ✅ Separate function for navigation
 const handleClick = () => {
  router.push("/monitor/plants/plant-detail/device-detail");
};
  return (
    <div className="mt-4 rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-md">
          <thead className="bg-gray-100 text-black sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Status</th>

              <th
                onClick={() => handleSort("name")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                Name <SortIcon column="name" />
              </th>

              <th
                onClick={() => handleSort("type")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                Type <SortIcon column="type" />
              </th>

              <th
                onClick={() => handleSort("sn")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                S/N <SortIcon column="sn" />
              </th>

              <th
                onClick={() => handleSort("power")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                Current Power <SortIcon column="power" />
              </th>

              <th
                onClick={() => handleSort("today")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                E-Today <SortIcon column="today" />
              </th>

              <th
                onClick={() => handleSort("total")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                E-Total <SortIcon column="total" />
              </th>

              <th
                onClick={() => handleSort("hours")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                H-Total <SortIcon column="hours" />
              </th>

              <th className="px-3 py-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {sortedDevices.map((device) => (
              <tr
                key={device.id}
                className="border-t border-gray-300 hover:bg-blue-50 text-black transition"
              >
                <td className="px-3 py-4">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      device.online ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </td>

                <td className="px-3 py-4 max-w-55 wrap-break-word"
                 onClick={handleClick}>
                  {/* <button 
                  className="text-blue-600 hover:underline cursor-pointer"> */}
                    {device.name}
                  {/* </button> */}
                </td>

                <td className="px-3 py-4">{device.type}</td>
                <td className="px-3 py-4">{device.sn}</td>
                <td className="px-3 py-4">{device.power.toFixed(2)} kW</td>
                <td className="px-3 py-4">{device.today.toFixed(2)} kWh</td>
                <td className="px-3 py-4">{device.total.toFixed(2)} MWh</td>
                <td className="px-3 py-4">{device.hours.toFixed(2)} h</td>
                <td className="px-3 py-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 text-sm hover:underline">
                      Edit
                    </button>
                    <button className="text-red-600 text-sm hover:underline">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------- Device Tab ----------
const DeviceTab = ({ devices }: { devices: Device[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedDevices = devices.slice(startIndex, endIndex);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-end">
        <button className="px-3 py-1 text-md rounded-md bg-blue-600 text-white hover:bg-blue-700">
          ➕ Add Inverter
        </button>
      </div>

      <DeviceTable devices={paginatedDevices} />

      <Pagination
        totalItems={devices.length}
        pageSize={pageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setPageSize={setPageSize}
      />
    </div>
  );
};


export default DeviceTab;
