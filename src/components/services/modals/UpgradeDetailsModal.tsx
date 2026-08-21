"use client";

import { X, CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { UpgradeJob } from "@/lib/api/schemas/service";

type Props = {
  job: UpgradeJob | null;
  onClose: () => void;
};

// Mirrors backend FOTA_JOB_STATUSES order
// (backendapps/src/server/features/fota/constants.ts) — used only to derive
// a progress percentage for the bar below; kept in sync by hand since the
// two apps don't share a types package.
const STATUS_ORDER = [
  "PENDING",
  "SENDING_INFORMATION",
  "LINK_SAVED",
  "DOWNLOADING",
  "DOWNLOAD_COMPLETED",
  "FLASHING",
  "RESTARTING",
  "COMPLETED",
];

function progressPercent(status: string): number {
  if (status === "FAILED") return 100;
  const index = STATUS_ORDER.indexOf(status);
  if (index === -1) return 0;
  return Math.round(((index + 1) / STATUS_ORDER.length) * 100);
}

export default function UpgradeDetailsModal({ job, onClose }: Props) {
  if (!job) return null;

  const isFailed = job.status === "FAILED";
  const percent = progressPercent(job.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">

      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-300 px-4 sm:px-6 py-4">
          <h2 className="text-lg font-medium">Upgrade Info</h2>

          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-black" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* DEVICE INFO */}
          <div className="border border-gray-300 rounded-md p-4 space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">SN:</span>{" "}
                <span className="font-medium">{job.inverterSerialNo}</span>
              </div>

              <div>
                <span className="text-gray-500">Chip Type:</span>{" "}
                <span className="font-medium">{job.chipType}</span>
              </div>

              <div>
                <span className="text-gray-500">Update Type:</span>{" "}
                <span className="font-medium">
                  {job.updateType === "FORCE" ? "Force" : "Normal"}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Status:</span>{" "}
                <span className={`font-medium ${isFailed ? "text-red-600" : "text-green-600"}`}>
                  {job.message}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Current Firmware:</span>{" "}
                <span className="font-medium">{job.currentFirmware ?? "—"}</span>
              </div>
              <div>
                <span className="text-gray-500">New Firmware Version:</span>{" "}
                <span className="font-medium">{job.newFirmwareVersion}</span>
              </div>
            </div>

            {job.failureReason && (
              <p className="text-sm text-red-600">Failure reason: {job.failureReason}</p>
            )}
          </div>

          {/* PROGRESS SECTION */}
          <div className="border border-gray-300 rounded-md p-6 space-y-5">

            <h3 className="text-blue-600 font-medium">
              Version Upgrade Progress
            </h3>

            <div className="text-sm">
              <p className="text-gray-500">Current Status:</p>
              <p className="font-medium">{job.message}</p>
            </div>

            {/* PROGRESS BAR */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Current Progress:</p>

              <div className="flex items-center gap-3">
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className={`h-2 rounded ${isFailed ? "bg-red-500" : "bg-blue-500"}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="text-sm">{percent}%</span>
              </div>
            </div>

            {/* COMMAND LOG */}
            <div className="space-y-3 text-sm">
              {job.commandLog.length === 0 && (
                <p className="text-gray-500">No command log entries yet.</p>
              )}

              {job.commandLog.map((log: any) => (
                <div key={log.step} className="flex items-center gap-3">
                  {log.status === "SUCCESS" ? (
                    <CheckCircle className="text-green-500 shrink-0" size={16} />
                  ) : log.status === "FAILED" || log.status === "TIMEOUT" ? (
                    <AlertCircle className="text-red-500 shrink-0" size={16} />
                  ) : (
                    <Clock className="text-gray-400 shrink-0" size={16} />
                  )}

                  <span>
                    Step {log.step} — {log.commandSent}
                  </span>

                  <span className="text-gray-500 ml-auto whitespace-nowrap">
                    {log.respondedAt ? `Responded: ${log.respondedAt}` : `Sent: ${log.sentAt}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
