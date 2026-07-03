"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type AddInverterModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
  loading?: boolean;
  message?: string;
  messageType?: "success" | "error" | null;
};
const AddInverterModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  message,
  messageType,
}: AddInverterModalProps) => {
  const [serial, setSerial] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!serial.trim()) return;

    await onSubmit(serial.trim());
  };
  const handleClose = () => {
    console.log("Resetting serial");
    setSerial("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white text-black rounded-xl shadow-xl p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Inverter</h2>

          <button onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Please enter inverter S/N"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />

        {message && (
          <div
            className={`mt-3 rounded px-3 py-2 text-sm ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Adding..." : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInverterModal;
