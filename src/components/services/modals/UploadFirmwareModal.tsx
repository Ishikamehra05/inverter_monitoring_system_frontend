"use client";

import { UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import clsx from "clsx";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    name: string;
    file: File | null;
    remark: string;
  }) => void;
}

export default function UploadFirmwareModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [firmwareName, setFirmwareName] = useState("");
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (selected: File | null) => {
    if (selected) {
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  const handleUpload = () => {
    if (!firmwareName.trim() || !file) return;
    onSubmit?.({ name: firmwareName, file, remark });
    onClose();
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
        <div className="flex flex-col sm:flex-row justify-end gap-3 px-5 sm:px-8 py-5 border-t border-(--divider) bg-(--surface)">
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
            disabled={!firmwareName || !file}
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
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
