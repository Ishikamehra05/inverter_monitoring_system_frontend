"use client";

import { X, CheckCircle, AlertCircle, FileText } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { useEffect, useState } from "react";
import UpgradeDetailsModal from "./modals/UpgradeDetailsModal";

const deviceData = Array.from({ length: 10 }).map((_, i) => ({
  sn: `2K02323-63430${600 + i}`,
  deviceStatus: i === 6 ? "Standby" : "Online",
  taskStatus: "DONE",
}));

export default function TaskDetailSidebar({
  task,
  onClose,
}: {
  task: any;
  onClose: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);


  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <>
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

          {/* ================= FILTER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-[14px] text-[rgba(0,0,0,0.65)]">
                Task Status :
              </span>

              <select
                className="
                h-8 w-full sm:w-60
                px-3 text-[14px]
                border border-[#d9d9d9]
                rounded-xs
                bg-white
                focus:outline-none
                focus:border-[#4096ff]
                focus:ring-2 focus:ring-[#1677ff]/20
                cursor-pointer
              "
              >
                <option>Please select</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="h-8 px-4 text-[14px] rounded-xs border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#1677ff] hover:text-[#1677ff] cursor-pointer transition">
                Reset
              </button>

              <button className="h-8 px-5 text-[14px] rounded-xs border border-[#1677ff] bg-[#1677ff] text-white hover:bg-[#4096ff] hover:border-[#4096ff] cursor-pointer transition">
                Query
              </button>
            </div>
          </div>

          {/* ================= TABLE ================= */}
          <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">
              <table className="min-w-200 w-full text-[14px]">

                {/* HEADER */}
                <thead className="bg-[#fafafa] text-[rgba(0,0,0,0.65)]">
                  <tr>
                    <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                      Device SN
                    </th>
                    <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                      Device Status
                    </th>
                    <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                      Task Status
                    </th>
                    <th className="px-6 py-3 border-b border-[rgba(0,0,0,0.06)]">
                      Operation
                    </th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {deviceData.map((device, index) => (
                    <tr
                      key={index}
                      className="hover:bg-[#fafafa] transition"
                    >
                      <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] whitespace-nowrap">
                        {device.sn}
                      </td>

                      {/* DEVICE STATUS */}
                      <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                        {device.deviceStatus === "Online" ? (
                          <div className="flex items-center gap-2 text-[#52c41a]">
                            <CheckCircle size={16} strokeWidth={2.5} />
                            <span>Online</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[#faad14]">
                            <AlertCircle size={16} strokeWidth={2.5} />
                            <span>Standby</span>
                          </div>
                        )}
                      </td>

                      {/* TASK STATUS */}
                      <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 text-[12px] font-medium rounded-xs border border-[#b7eb8f] bg-[#f6ffed] text-[#52c41a]">
                          <CheckCircle size={14} strokeWidth={2.5} />
                          DONE
                        </span>
                      </td>

                      {/* OPERATION */}
                      <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                        <div className="flex justify-center">
                          <FileText
                            onClick={() => setOpen(true)}
                            size={18}
                            className="text-[#1677ff] cursor-pointer hover:text-[#4096ff]"
                          />
                        </div>
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
      <UpgradeDetailsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}