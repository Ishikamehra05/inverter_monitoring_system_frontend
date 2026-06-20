"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  device: {
    id: string;
    name: string;
  } | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const DeleteInverterModal = ({
  open,
  device,
  onClose,
  onConfirm,
}: Props) => {
  if (!open || !device) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-red-600">
            Delete Inverter
          </h2>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="text-gray-600">
          Are you sure you want to delete
          <span className="font-semibold"> {device.name}</span>?
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInverterModal;