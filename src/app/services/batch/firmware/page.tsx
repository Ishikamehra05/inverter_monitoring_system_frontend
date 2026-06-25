"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import UploadFirmwareModal from "@/components/services/modals/UploadFirmwareModal";
import { useFirmware } from "@/hooks/api/useService";

const PAGE_SIZE = 5;

const dummyData = [
  {
    name: "G9511-251401-13_212608",
    version: "G9511-251401-13_212608",
    time: "2026-02-11 13:42:22",
    remark: "Release Firmware",
  },
  {
    name: "G9511-251400-13_212603",
    version: "G9511-251400-13_212603",
    time: "2026-02-11 13:41:29",
    remark: "Release Firmware",
  },
  {
    name: "SPECIAL-G9500-039600-12_312532",
    version: "G9500-039600-12_312532",
    time: "2026-02-09 17:44:37",
    remark: "Optimized 5V Abnormal Range",
  },
  {
    name: "SPECIAL-G9500-030100-03_410733",
    version: "G9500-030100-03_410733",
    time: "2026-01-28 13:10:55",
    remark: "Record writing command 02",
  },
  {
    name: "Special-G9500-030100-03_410734",
    version: "G9500-030100-03_410734",
    time: "2026-01-21 18:30:32",
    remark: "-",
  },
  {
    name: "G9500-039600-12_312408",
    version: "G9500-039600-12_312408",
    time: "2026-01-16 15:54:22",
    remark: "Release Firmware",
  },
  {
    name: "SPECIAL-G9500-03A500-02_210530",
    version: "G9500-03A500-02_210530",
    time: "2026-01-14 14:52:58",
    remark: "Optimize the noise issue",
  },
];

export default function BatchFirmwareListPage() {
  const [firmwareName, setFirmwareName] = useState("");
  const [firmwareVersion, setFirmwareVersion] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const firmwareQuery = useFirmware({
    firmwareName,
    firmwareVersion,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const totalPages =
    firmwareQuery.data?.pagination.totalPages ??
    Math.ceil(dummyData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    if (firmwareQuery.data) {
      return firmwareQuery.data.items.map((item) => ({
        name: item.name,
        version: item.version,
        time: item.createdTime,
        remark: item.remark,
      }));
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    return dummyData.slice(start, start + PAGE_SIZE);
  }, [currentPage, firmwareQuery.data]);

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        {/* ================= FILTER BOX ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
          <div className="flex flex-col xl:flex-row xl:items-center gap-6 ">
            {/* Name */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-[14px] text-[rgba(0,0,0,0.65)] whitespace-nowrap">
                Firmware Name :
              </span>
              <input
                value={firmwareName}
                onChange={(e) => setFirmwareName(e.target.value)}
                placeholder="Please Enter Firmware Name"
                className="h-8 w-full sm:w-64 px-2.75 text-[14px] border border-[#d9d9d9] rounded-xs focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition"
              />
            </div>

            {/* Version */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-[14px] text-[rgba(0,0,0,0.65)] whitespace-nowrap">
                Firmware Version :
              </span>
              <input
                value={firmwareVersion}
                onChange={(e) => setFirmwareVersion(e.target.value)}
                placeholder="Please Enter Firmware Version"
                className="h-8 w-full sm:w-64 px-[11px] text-[14px] border border-[#d9d9d9] rounded-[2px] focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 xl:ml-auto">
              <button className="h-8 px-4 text-[14px] rounded-[2px] border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#1890ff] hover:text-[#1890ff] transition">
                Reset
              </button>

              <button className="h-8 px-5 text-[14px] rounded-[2px] border border-[#1890ff] bg-[#1890ff] text-white hover:bg-[#40a9ff] hover:border-[#40a9ff] transition">
                Query
              </button>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-[16px] font-medium text-[rgba(0,0,0,0.85)]">
              Firmware List
            </h2>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setOpen(true)}
                className="px-4 h-8 bg-[#1890ff] text-white text-[14px] rounded-[2px] hover:bg-[#40a9ff] transition"
              >
                Upload Firmware
              </button>

              <RefreshCw
                size={18}
                className="text-[rgba(0,0,0,0.45)] cursor-pointer hover:text-[rgba(0,0,0,0.85)] transition"
              />
            </div>
          </div>

          {/* Table (Responsive Scroll) */}
          {firmwareQuery.isLoading && (
            <div className="py-6 text-center text-[rgba(0,0,0,0.45)]">
              Loading firmware...
            </div>
          )}
          {firmwareQuery.isError && (
            <div className="py-6 text-center text-[#ff4d4f]">
              Unable to load firmware.
            </div>
          )}
          <div className="overflow-x-auto border border-[#f0f0f0] rounded-lg">
            <table className="min-w-[900px] w-full text-[14px]">
              <thead className="bg-[#fafafa] text-[rgba(0,0,0,0.65)]">
                <tr>
                  <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                    Firmware Name
                  </th>
                  <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                    Firmware Version
                  </th>
                  <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                    Created Time
                  </th>
                  <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                    Firmware Remark
                  </th>
                  <th className="px-6 py-3 text-right border-b border-[rgba(0,0,0,0.06)]">
                    Operation
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={index} className="hover:bg-[#fafafa] transition">
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] truncate max-w-[200px]">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                      {item.version}
                    </td>
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] whitespace-nowrap">
                      {item.time}
                    </td>
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] truncate max-w-[200px]">
                      {item.remark}
                    </td>
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] text-right">
                      <Trash2
                        size={16}
                        className="text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] cursor-pointer transition"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center sm:justify-end px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <UploadFirmwareModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(data) => console.log(data)}
      />
    </div>
  );
}
