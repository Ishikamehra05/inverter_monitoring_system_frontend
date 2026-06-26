"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface UpgradeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  model?: string;
  sn?: string;
  mdsp?: string;
  sdsp?: string;
  csb?: string;
  status?: string;
}

const FIRMWARE_OPTIONS = [
  "firmware_v1.0.0.bin",
  "firmware_v1.1.0.bin",
  "firmware_v2.0.0.bin",
];

export default function UpgradeInfoModal({
  isOpen,
  onClose,
  model = "PSIS4K6SM1R2",
  sn = "2502-65764179P",
  mdsp = "311802",
  sdsp = "310601",
  csb = "010607",
  status = "DONE",
}: UpgradeInfoModalProps) {
  const [selectedFile, setSelectedFile] = useState("");
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleBegin = () => {
    if (!selectedFile || isUpgrading) return;
    setIsUpgrading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUpgrading(false);
          return 100;
        }
        return prev + 2;
      });
    }, 80);
  };

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Model :", value: model },
    { label: "SN :", value: sn },
    { label: "MDSP :", value: mdsp },
    { label: "SDSP :", value: sdsp },
    { label: "CSB :", value: csb },
    { label: "Status :", value: status },
    {
      label: "Progress :",
      value: (
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-[#1890FF] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 w-8 text-right flex-shrink-0">
            {progress}%
          </span>
        </div>
      ),
    },
    {
      label: "File :",
      value: (
        <div className="relative w-64">
          <button
            onClick={() => setFileDropdownOpen(!fileDropdownOpen)}
            className="w-full flex items-center justify-between border border-gray-300 rounded px-3 py-2 text-sm text-gray-400 bg-white hover:border-[#1890FF] focus:outline-none focus:border-[#1890FF] transition-colors"
          >
            <span className={selectedFile ? "text-gray-700" : ""}>
              {selectedFile || "Please Select Firmware"}
            </span>
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
          </button>
          {fileDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-20">
              {FIRMWARE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedFile(opt);
                    setFileDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                    selectedFile === opt ? "text-[#1890FF] bg-blue-50" : "text-gray-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Operation :",
      value: (
        <button
          onClick={handleBegin}
          disabled={!selectedFile || isUpgrading}
          className={`px-8 py-1.5 text-sm border rounded transition-colors ${
            !selectedFile || isUpgrading
              ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white"
              : "border-gray-300 text-gray-700 hover:border-[#1890FF] hover:text-[#1890FF] bg-white cursor-pointer"
          }`}
        >
          {isUpgrading ? "Upgrading..." : "Begin"}
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