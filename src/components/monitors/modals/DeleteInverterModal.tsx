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
  loading?: boolean;

  /**
   * Default values are for existing Inverter/SN deletion.
   * For Account deletion, pass:
   * title="Delete Account"
   */
  title?: string;
};

const DeleteInverterModal = ({
  open,
  device,
  onClose,
  onConfirm,
  loading = false,
  title = "Delete Inverter",
}: Props) => {
  if (!open || !device) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await onConfirm();

      // Success/error toast parent component handle karega.
      // Yahan toast nahi rakha gaya hai taaki duplicate toast na aaye.
      onClose();
    } catch (error) {
      // Error parent ke catch block ko milna chahiye.
      // Isliye error ko dobara throw kar rahe hain.
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-red-600">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Confirmation Message */}
        <p className="text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800">
            {device.name}
          </span>
          ?
        </p>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInverterModal;