"use client";

import { UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import clsx from "clsx";

const CHIP_TYPES = [
  "MASTER_DSP",
  "SLAVE_DSP",
  "CSB",
  "DCDC_DSP",
  "AFCI",
  "BMS1",
  "BMS2",
  "LCD",
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    name: string;
    chipType: string;
    file: File | null;
    remark: string;
  }) => void | Promise<void>;
  isSubmitting?: boolean;
}

export default function UploadFirmwareModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const [firmwareName, setFirmwareName] = useState("");
  const [chipType, setChipType] = useState("");
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (selected: File | null) => {
    if (selected) {
      setFile(selected);
      setUploadError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!firmwareName.trim() || !chipType || !file || isSubmitting) return;

    try {
      setUploadError(null);
      await onSubmit?.({ name: firmwareName, chipType, file, remark });
      onClose();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

      {/* ================= MODAL ================= */}
      <div
        className="
          w-full
          max-w-2xl
          max-h-[90vh]
          overflow-y-auto
          rounded-xl
          bg-(--card)
          border border-(--border)
          shadow-lg
          flex flex-col
        "
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-(--divider) bg-(--surface)">
          <h2 className="text-base sm:text-lg font-medium">
            Firmware Info
          </h2>

          <button
            onClick={onClose}
            className="text-(--muted-fg) hover:text-(--foreground) transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-8">

          {/* Firmware Name */}
          <div>
            <label className="block mb-2 text-sm text-(--muted-fg)">
              <span className="text-red-500 mr-1">*</span>
              Firmware Name
            </label>

            <input
              value={firmwareName}
              onChange={(e) => setFirmwareName(e.target.value)}
              placeholder="Please Enter Firmware Name"
              className="input-light"
            />
          </div>

          {/* Chip Type */}
          <div>
            <label className="block mb-2 text-sm text-(--muted-fg)">
              <span className="text-red-500 mr-1">*</span>
              Chip Type
            </label>

            <select
              value={chipType}
              onChange={(e) => setChipType(e.target.value)}
              className="input-light"
            >
              <option value="">Please Select Chip Type</option>
              {CHIP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Upload File */}
          <div>
            <label className="block mb-2 text-sm text-(--muted-fg)">
              <span className="text-red-500 mr-1">*</span>
              Upload File
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={clsx(
                `
                border
                border-dashed
                rounded-lg
                min-h-[140px]
                sm:min-h-[160px]
                flex
                flex-col
                items-center
                justify-center
                text-center
                px-4
                cursor-pointer
                transition
                `,
                dragActive
                  ? "border-(--primary) bg-(--primary)/5"
                  : "border-(--border) bg-(--surface)"
              )}
            >
              <UploadCloud
                size={28}
                className="text-(--primary) mb-3"
              />

              {file ? (
                <p className="text-sm text-(--foreground) break-all">
                  {file.name}
                </p>
              ) : (
                <p className="text-sm text-(--muted-fg)">
                  Click or drag file to this area to upload
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(e) =>
                handleFile(e.target.files?.[0] || null)
              }
            />
          </div>

          {/* Remark */}
          <div>
            <label className="block mb-2 text-sm text-(--muted-fg)">
              Firmware Remark
            </label>

            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Please Enter Firmware Remark"
              rows={3}
              className="
                w-full
                rounded-md
                border border-(--input)
                bg-(--surface)
                px-3 py-2
                text-sm
                placeholder:text-(--muted-fg)
                focus:outline-none
                focus:border-(--primary)
                resize-none
              "
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 px-5 sm:px-8 py-5 border-t border-(--divider) bg-(--surface)">
          {uploadError && (
            <p className="text-sm text-[#ff4d4f] sm:mr-auto">
              {uploadError}
            </p>
          )}
          <button
            onClick={onClose}
            className="
              w-full sm:w-auto
              px-6
              h-10
              rounded-md
              border border-(--border)
              bg-(--surface)
              hover:bg-(--surface-hover)
              text-sm
              transition
            "
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={!firmwareName || !chipType || !file || isSubmitting}
            className="
              w-full sm:w-auto
              px-6
              h-10
              rounded-md
              bg-(--primary)
              text-(--primary-fg)
              text-sm
              hover:bg-(--primary-hover)
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition
            "
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
