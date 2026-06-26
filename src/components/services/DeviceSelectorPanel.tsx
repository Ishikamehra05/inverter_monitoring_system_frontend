"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Pagination from "@/components/ui/Pagination"; 

const mockDevices = [
  {
    sn: "2222-22222222T",
    status: "Online",
    protocol: "PVI",
    account: "enduser.lincoln",
    updated: "-",
    model: "-",
    mdsp: "-",
    sdsp: "-",
    dcdc: "-",
    csb: "-",
  },
  {
    sn: "2248-50900391P",
    status: "Online",
    protocol: "PVI",
    account: "Roshan",
    updated: "2022-12-20 15:02:19",
    model: "G9500-058300-06_111200",
    mdsp: "G9500-058300-06_111200",
    sdsp: "IN1110",
    dcdc: "-",
    csb: "CN0000",
  },
  {
    sn: "224650430143p",
    status: "Online",
    protocol: "PVI",
    account: "p_jaincs@rediffmail.com",
    updated: "-",
    model: "-",
    mdsp: "-",
    sdsp: "-",
    dcdc: "-",
    csb: "-",
  },
  {
    sn: "2246-50430151P",
    status: "Online",
    protocol: "OTA",
    account: "Venu3kw",
    updated: "2026-02-20 19:50:37",
    model: "iS-3K-SM1",
    mdsp: "03A500-02_210406",
    sdsp: "058301-05_IN1110",
    dcdc: "-",
    csb: "050400-09_011810",
  },
  {
    sn: "2247-50410916P",
    status: "Online",
    protocol: "OTA",
    account: "mvprasad67@gmail.com",
    updated: "2026-02-23 12:55:41",
    model: "iS-2K-SM1",
    mdsp: "03A500-02_210408",
    sdsp: "058301-05_IN1110",
    dcdc: "-",
    csb: "050400-09_011810",
  },
  {
    sn: "2247-50410900P",
    status: "Online",
    protocol: "OTA",
    account: "unknown@example.com",
    updated: "-",
    model: "iS-2K-SM1",
    mdsp: "03A500-02_210405",
    sdsp: "058301-05_IN1110",
    dcdc: "-",
    csb: "050000W-00_020000",
  },
];

export default function DeviceSelectorPanel({
  onClose,
  onConfirm,
  selectedDevices,
}: {
  onClose: () => void;
  onConfirm: (devices: string[]) => void;
  selectedDevices: string[];
}) {
  const [selected, setSelected] = useState<string[]>(selectedDevices);
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const PAGE_SIZE = 8;
  const totalPages = Math.ceil(mockDevices.length / PAGE_SIZE);

  const paginated = mockDevices.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleDevice = (sn: string) => {
    setSelected((prev) =>
      prev.includes(sn) ? prev.filter((d) => d !== sn) : [...prev, sn]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f5] overflow-y-auto">
      {/* HEADER */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
        <h2 className="text-[16px] font-medium text-[#000000D9]">
          Device List
        </h2>
        <button
          onClick={onClose}
          className="text-[#000000D9] hover:text-[#1890ff] transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-8 max-w-7xl mx-auto">
        {/* FILTER SECTION */}
        <div className="space-y-6 border-b border-[rgba(0,0,0,0.06)] pb-6">
          {/* Basic filters (always visible) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-[#000000D9]">Device SN:</span>
              <input
                className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition placeholder:text-[#000000D9]"
                placeholder="Please enter"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-[#000000D9]">Device Status:</span>
              <select className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] focus:outline-none focus:border-[#40a9ff]">
                <option className="text-[#000000D9]">Please select</option>
              </select>
            </div>
          </div>

          {/* Expanded fields */}
          {expanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#000000D9]">Protocol:</span>
                <select className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px]">
                  <option className="text-[#000000D9]">Please select</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#000000D9]">Owning Account:</span>
                <input
                  className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] placeholder:text-[#000000D9]"
                  placeholder="Please enter"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#000000D9]">Model Name:</span>
                <input
                  className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] placeholder:text-[#000000D9]"
                  placeholder="Please enter"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#000000D9]">MDSP Version:</span>
                <input
                  className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] placeholder:text-[#000000D9]"
                  placeholder="Please enter"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#000000D9]">SDSP Version:</span>
                <input
                  className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] placeholder:text-[#000000D9]"
                  placeholder="Please enter"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#000000D9]">DCDC Version:</span>
                <input
                  className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] placeholder:text-[#000000D9]"
                  placeholder="Please enter"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#000000D9]">CSB Version:</span>
                <input
                  className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] placeholder:text-[#000000D9]"
                  placeholder="Please enter"
                />
              </div>
            </div>
          )}

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <button className="h-8 px-4 text-[14px] rounded-[2px] border border-[#d9d9d9] text-[#000000D9] hover:border-[#1890ff] hover:text-[#1890ff] transition">
              Reset
            </button>
            <button className="h-8 px-6 text-[14px] rounded-[2px] bg-[#1890ff] text-white hover:bg-[#40a9ff] transition">
              Query
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#1890ff] text-[14px] font-medium hover:text-[#40a9ff] ml-2"
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>

        {/* TABLE with horizontal scroll and sticky first column */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[2px] overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full text-[14px] border-collapse">
              <thead className="bg-[#fafafa] text-[#000000D9]">
                <tr>
                  {/* Checkbox column - sticky */}
                  <th
                    className="p-3 w-12 sticky left-0 bg-[#fafafa] z-10"
                    style={{ minWidth: "3rem" }}
                  ></th>
                  {/* Device SN - sticky with left offset */}
                  <th
                    className="p-3 text-left font-medium sticky left-12 bg-[#fafafa] z-10 text-[#000000D9]"
                    style={{ minWidth: "150px" }}
                  >
                    Device SN
                  </th>
                  {/* Remaining columns - scrollable */}
                  <th className="p-3 text-left font-medium whitespace-nowrap text-[#000000D9]">Device Status</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap text-[#000000D9]">Protocol</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap text-[#000000D9]">Owning Account</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap text-[#000000D9]">Updated Time</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap text-[#000000D9]">Model Name</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap text-[#000000D9]">MDSP Version</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap text-[#000000D9]">SDSP Version</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap text-[#000000D9]">DCDC Version</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap text-[#000000D9]">CSB Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                {paginated.map((device) => (
                  <tr key={device.sn} className="hover:bg-[#fafafa] transition">
                    {/* Checkbox cell - sticky */}
                    <td
                      className="p-3 text-center sticky left-0 bg-white z-10"
                      style={{ minWidth: "3rem" }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(device.sn)}
                        onChange={() => toggleDevice(device.sn)}
                        className="rounded border-[#d9d9d9] text-[#1890ff] focus:ring-[#1890ff]"
                      />
                    </td>
                    {/* Device SN cell - sticky with left offset */}
                    <td
                      className="p-3 text-[#1890ff] cursor-pointer whitespace-nowrap hover:underline font-mono sticky left-12 bg-white z-10 text-[#000000D9]"
                      style={{ minWidth: "150px" }}
                    >
                      {device.sn}
                    </td>
                    {/* Scrollable cells */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-[#52c41a] text-lg leading-3">●</span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-[#000000D9]">{device.protocol}</td>
                    <td className="p-3 max-w-[200px] truncate text-[#000000D9]">{device.account}</td>
                    <td className="p-3 whitespace-nowrap text-[#000000D9]">{device.updated}</td>
                    <td className="p-3 whitespace-nowrap text-[#000000D9]">{device.model}</td>
                    <td className="p-3 whitespace-nowrap font-mono text-[12px] text-[#000000D9]">{device.mdsp}</td>
                    <td className="p-3 whitespace-nowrap font-mono text-[12px] text-[#000000D9]">{device.sdsp}</td>
                    <td className="p-3 whitespace-nowrap font-mono text-[12px] text-[#000000D9]">{device.dcdc}</td>
                    <td className="p-3 whitespace-nowrap font-mono text-[12px] text-[#000000D9]">{device.csb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION - BOTTOM */}
          <div className="flex justify-center sm:justify-end px-4 py-4 border-t border-[rgba(0,0,0,0.06)]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* FOOTER with Cancel/OK */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-8 px-6 text-[14px] rounded-[2px] border border-[#d9d9d9] text-[#000000D9] hover:border-[#1890ff] hover:text-[#1890ff] transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selected);
              onClose();
            }}
            className="h-8 px-6 text-[14px] rounded-[2px] bg-[#1890ff] text-white hover:bg-[#40a9ff] transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}