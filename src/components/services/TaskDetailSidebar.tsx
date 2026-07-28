"use client";

import { X, CheckCircle, AlertCircle, Loader2, FileText } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { useEffect, useMemo, useState } from "react";
import UpgradeDetailsModal from "./modals/UpgradeDetailsModal";
import { useUpgradeTaskDetail } from "@/hooks/api/useService";
import type { UpgradeJob } from "@/lib/api/schemas/service";

const PAGE_SIZE = 10;

// Mirrors backend FOTA_JOB_STATUS_MESSAGES
// (backendapps/src/server/features/fota/constants.ts) — kept in sync by hand
// since the two apps don't share a types package.
const STATUS_MESSAGES: Record<string, string> = {
  PENDING: "Pending",
  SENDING_INFORMATION: "Sending firmware information",
  LINK_SAVED: "Firmware information saved",
  DOWNLOADING: "Downloading firmware",
  DOWNLOAD_COMPLETED: "Firmware downloaded",
  FLASHING: "Installing firmware",
  RESTARTING: "Inverter is restarting",
  COMPLETED: "Firmware updated successfully",
  FAILED: "Firmware update failed",
};

function StatusBadge({ status }: { status: string }) {
  const isDone = status === "COMPLETED";
  const isFailed = status === "FAILED";

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-0.5 text-[12px] font-medium rounded-xs border ${
        isDone
          ? "border-[#b7eb8f] bg-[#f6ffed] text-[#52c41a]"
          : isFailed
          ? "border-[#ffa39e] bg-[#fff1f0] text-[#ff4d4f]"
          : "border-[#91d5ff] bg-[#e6f7ff] text-[#1890ff]"
      }`}
    >
      {isDone ? (
        <CheckCircle size={14} strokeWidth={2.5} />
      ) : isFailed ? (
        <AlertCircle size={14} strokeWidth={2.5} />
      ) : (
        <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
      )}
      {STATUS_MESSAGES[status] ?? status}
    </span>
  );
}

export default function TaskDetailSidebar({
  task,
  onClose,
}: {
  task: { id: string | number; name: string; status?: string; created?: string; begin?: string };
  onClose: () => void;
}) {
  const taskId = String(task.id);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<UpgradeJob | null>(null);

  const detailQuery = useUpgradeTaskDetail(taskId);
  const jobs = useMemo(() => detailQuery.data?.jobs ?? [], [detailQuery.data]);

  const availableStatuses = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.status))),
    [jobs]
  );

  const filteredJobs = useMemo(
    () => (statusFilter ? jobs.filter((job) => job.status === statusFilter) : jobs),
    [jobs, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const pageJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
          <div>
            <h2 className="text-[16px] font-medium text-[rgba(0,0,0,0.85)]">
              Detail Info — {task.name}
            </h2>
            {detailQuery.data && (
              <p className="text-[12px] text-[rgba(0,0,0,0.45)] mt-1">
                Status: {detailQuery.data.status} · Created: {detailQuery.data.createdAt}
              </p>
            )}
          </div>

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
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                <option value="">All statuses</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_MESSAGES[status] ?? status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setStatusFilter("");
                  setCurrentPage(1);
                }}
                className="h-8 px-4 text-[14px] rounded-xs border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#1677ff] hover:text-[#1677ff] cursor-pointer transition"
              >
                Reset
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className="h-8 px-5 text-[14px] rounded-xs border border-[#1677ff] bg-[#1677ff] text-white hover:bg-[#4096ff] hover:border-[#4096ff] cursor-pointer transition"
              >
                Query
              </button>
            </div>
          </div>

          {/* ================= TABLE ================= */}
          <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-xl shadow-sm overflow-hidden">

            {detailQuery.isLoading && (
              <div className="py-10 text-center text-[rgba(0,0,0,0.45)]">
                Loading task details...
              </div>
            )}

            {detailQuery.isError && (
              <div className="py-10 text-center text-[#ff4d4f]">
                Unable to load task details.
              </div>
            )}

            {!detailQuery.isLoading && !detailQuery.isError && (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-200 w-full text-[14px]">

                    {/* HEADER */}
                    <thead className="bg-[#fafafa] text-[rgba(0,0,0,0.65)]">
                      <tr>
                        <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                          Device SN
                        </th>
                        <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                          Firmware Version
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
                      {pageJobs.map((job: any) => (
                        <tr key={job.jobId} className="hover:bg-[#fafafa] transition">
                          <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] whitespace-nowrap font-mono">
                            {job.inverterSerialNo}
                          </td>

                          <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                            {job.newFirmwareVersion}
                          </td>

                          <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                            <StatusBadge status={job.status} />
                          </td>

                          <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                            <div className="flex justify-center">
                              <FileText
                                onClick={() => setSelectedJob(job)}
                                size={18}
                                className="text-[#1677ff] cursor-pointer hover:text-[#4096ff]"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}

                      {pageJobs.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-6 text-center text-[rgba(0,0,0,0.45)]"
                          >
                            No devices in this task.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-center sm:justify-end px-6 py-4 border-t border-[rgba(0,0,0,0.06)]">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <UpgradeDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </>
  );
}
