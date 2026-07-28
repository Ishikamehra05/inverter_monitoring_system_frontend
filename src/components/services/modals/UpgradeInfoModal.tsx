"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronDown } from "lucide-react";
import { useFirmware, useCreateUpgradeTask } from "@/hooks/api/useService";

interface UpgradeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  model?: string;
  sn?: string;
  plantId?: string;
  status?: string;
}

export default function UpgradeInfoModal({
  isOpen,
  onClose,
  model = "PSIS4K6SM1R2",
  sn = "2502-65764179P",
  plantId,
  status = "DONE",
}: UpgradeInfoModalProps) {
  const [selectedFirmwareId, setSelectedFirmwareId] = useState("");
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [session, setSession] = useState<{ open: boolean; sn?: string }>({ open: false });

  // Same firmware catalog CreateTaskPanel's Firmware Package dropdown reads
  // from — real data, not the hardcoded filename list this used to have.
  const firmwareQuery = useFirmware({ pageSize: 100 });
  const firmwareOptions = firmwareQuery.data?.items ?? [];
  const selectedFirmware = firmwareOptions.find((item) => item.id === selectedFirmwareId);

  const createUpgradeTaskMutation = useCreateUpgradeTask();

  // Reset per-device state whenever the modal opens for a (possibly
  // different) device — mirrors RemoteSettingModal's session pattern, so
  // reopening for another row doesn't carry over the last device's
  // selection or success/error state.
  if (isOpen && (!session.open || session.sn !== sn)) {
    setSession({ open: true, sn });
    setSelectedFirmwareId("");
    createUpgradeTaskMutation.reset();
  } else if (!isOpen && session.open) {
    setSession({ open: false });
  }

  if (!isOpen) return null;

  // updateType has no control in this modal (single-device Upgrade is meant
  // to be a quick action, not a full form) — hardcoded to NORMAL, per
  // Zupgradeinfo-02.md §5 step 7. name is auto-generated for the same
  // reason (step 6) rather than adding a Task Name input.
  const handleBegin = () => {
    if (!selectedFirmware || !selectedFirmware.chipType || createUpgradeTaskMutation.isPending) {
      return;
    }

    createUpgradeTaskMutation.mutate({
      name: `Upgrade ${sn} - ${new Date().toLocaleString()}`,
      newFirmwareVersion: selectedFirmware.version,
      firmwareId: selectedFirmware.id,
      chipType: selectedFirmware.chipType,
      updateType: "NORMAL",
      devices: [
        {
          inverterSerialNo: sn,
          ...(plantId ? { plantId } : {}),
        },
      ],
    });
  };

  const isUpgrading = createUpgradeTaskMutation.isPending;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Model :", value: model },
    { label: "SN :", value: sn },
    { label: "Status :", value: status },
    {
      label: "Progress :",
      value: createUpgradeTaskMutation.isPending ? (
        <span className="text-gray-600">Submitting...</span>
      ) : createUpgradeTaskMutation.isSuccess ? (
        <span className="text-green-600">
          Job created (task {createUpgradeTaskMutation.data?.taskId}) — status: Pending.{" "}
          <Link href="/services/batch/task" className="underline hover:text-green-700">
            View progress
          </Link>
        </span>
      ) : createUpgradeTaskMutation.isError ? (
        <span className="text-red-500">
          {createUpgradeTaskMutation.error instanceof Error
            ? createUpgradeTaskMutation.error.message
            : "Failed to start upgrade. Please try again."}
        </span>
      ) : (
        <span className="text-gray-400">Not started</span>
      ),
    },
    {
      label: "File :",
      value: (
        <div className="relative w-64">
          <button
            onClick={() => setFileDropdownOpen(!fileDropdownOpen)}
            disabled={firmwareQuery.isLoading}
            className="w-full flex items-center justify-between border border-gray-300 rounded px-3 py-2 text-sm text-gray-400 bg-white hover:border-[#1890FF] focus:outline-none focus:border-[#1890FF] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={selectedFirmware ? "text-gray-700" : ""}>
              {firmwareQuery.isLoading
                ? "Loading firmware..."
                : selectedFirmware
                ? `${selectedFirmware.name} (${selectedFirmware.version})`
                : "Please Select Firmware"}
            </span>
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
          </button>
          {fileDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-20 max-h-60 overflow-y-auto">
              {firmwareOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-400">No firmware available</div>
              )}
              {firmwareOptions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedFirmwareId(item.id);
                    setFileDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                    selectedFirmwareId === item.id ? "text-[#1890FF] bg-blue-50" : "text-gray-700"
                  }`}
                >
                  {item.name} ({item.version})
                  {item.chipType ? ` — ${item.chipType}` : ""}
                </button>
              ))}
            </div>
          )}
          {firmwareQuery.isError && (
            <p className="mt-1 text-xs text-red-500">Unable to load firmware list.</p>
          )}
        </div>
      ),
    },
    {
      label: "Operation :",
      value: (
        <button
          onClick={handleBegin}
          disabled={!selectedFirmware?.chipType || isUpgrading}
          className={`px-8 py-1.5 text-sm border rounded transition-colors ${
            !selectedFirmware?.chipType || isUpgrading
              ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white"
              : "border-gray-300 text-gray-700 hover:border-[#1890FF] hover:text-[#1890FF] bg-white cursor-pointer"
          }`}
        >
          {isUpgrading ? "Submitting..." : "Begin"}
        </button>
      ),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span className="text-base font-semibold text-gray-900">Upgrade Info</span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="text-sm text-gray-700 w-28 flex-shrink-0">{label}</span>
                <div className="flex-1 text-sm text-gray-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}