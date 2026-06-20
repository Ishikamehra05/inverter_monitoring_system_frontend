"use client";

import { useState } from "react";
import { X } from "lucide-react";

type AddLoggerModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
};

const AddLoggerModal = ({ open, onClose, onSubmit }: AddLoggerModalProps) => {
  const [serial, setSerial] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!serial.trim()) return;
    onSubmit(serial);
    setSerial("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {/* Modal */}
      <div className="w-full max-w-lg bg-white text-black rounded-xl shadow-xl p-6 relative animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Add Datalogger
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Please enter datalogger S/N"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300
            text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-md bg-blue-600
            text-white hover:bg-blue-700 transition cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLoggerModal;
