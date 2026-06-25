"use client";

import { X, CheckCircle } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { useEffect, useState } from "react";

const deviceData = Array.from({ length: 10 }).map((_, i) => ({
  sn: `2K02323-63430${600 + i}`,
  deviceStatus: i === 6 ? "Offline" : "Online",
  result: "Succeeded",
}));

export default function TaskDetailSidebar({
  task,
  onClose,
}: {
  task: any;
  onClose: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.body.classList.add("body-no-scroll");
    return () => {
      document.body.classList.remove("body-no-scroll");
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-(--background) flex flex-col">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-6 sm:px-10 py-5 bg-white border-b border-[rgba(0,0,0,0.06)]">
        <h2 className="text-[16px] font-medium text-[rgba(0,0,0,0.85)]">
          Detail Info
        </h2>

        <button
          onClick={onClose}
          className="text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)] cursor-pointer transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-8">
        {/* ================= FILTER SECTION ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-[14px] text-[rgba(0,0,0,0.65)]">
              Task Status :
            </span>

            <select
              className="
                h-8
                w-full sm:w-60
                px-[11px]
                text-[14px]
                border border-[#d9d9d9]
                rounded-[2px]
                bg-white
                focus:outline-none
                focus:border-[#40a9ff]
                focus:ring-2 focus:ring-[#1890ff]/20
                cursor-pointer
                transition
              "
            >
              <option>Please select</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="h-8 px-4 text-[14px] rounded-xs border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#1890ff] hover:text-[#1890ff] cursor-pointer transition">
              Reset
            </button>

            <button className="h-8 px-5 text-[14px] rounded-xs border border-[#1890ff] bg-[#1890ff] text-white hover:bg-[#40a9ff] hover:border-[#40a9ff] cursor-pointer transition">
              Query
            </button>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-[14px]">
              {/* HEADER */}
              <thead className="bg-[#fafafa] text-[rgba(0,0,0,0.65)]">
                <tr>
                  <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                    Device SN
                  </th>
                  <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                    Device Status
                  </th>
                  <th className="px-6 py-3 text-right border-b border-[rgba(0,0,0,0.06)]">
                    Send Command
                  </th>
                  <th className="px-6 py-3 text-right border-b border-[rgba(0,0,0,0.06)]">
                    Reply Command
                  </th>
                  <th className="px-6 py-3 text-right border-b border-[rgba(0,0,0,0.06)]">
                    Result
                  </th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {deviceData.map((device, index) => (
                  <tr key={index} className="hover:bg-[#fafafa] transition">
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] whitespace-nowrap">
                      {device.sn}
                    </td>

                    {/* DEVICE STATUS */}
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                      {device.deviceStatus === "Online" ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#52c41a]" />
                          <span className="text-[#52c41a]">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[rgba(0,0,0,0.45)]" />
                          <span className="text-[rgba(0,0,0,0.45)]">
                            Offline
                          </span>
                        </div>
                      )}
                    </td>

                    {/* TASK STATUS */}
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] text-right text-[rgba(0,0,0,0.45)] transition">
                      01800600060E10
                    </td>

                    {/* OPERATION */}
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] text-right text-[rgba(0,0,0,0.45)] transition">
                      018006F1C214
                    </td>
                    {/* RESULT */}
                    <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] text-right text-[rgba(0,0,0,0.45)] transition">
                      Succeeded
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center sm:justify-end px-6 py-4 border-t border-[rgba(0,0,0,0.06)]">
            <Pagination
              currentPage={currentPage}
              totalPages={5}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
