"use client";

import { X } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  device: {
    id: string;
    name: string;
  } | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
};

const DeleteInverterModal = ({
  open,
  device,
  onClose,
  onConfirm,
  loading = false,
}: Props) => {
  if (!open || !device) return null;
  const handleDelete = async () => {
    if (!device) {
      toast.error("No inverter selected.");
      return;
    }

    try {
      await onConfirm();

      toast.success("Inverter deleted successfully.");

      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete inverter.",
      );
    }
  };
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
            disabled={loading}
            className="border px-4 py-2 rounded text-black disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInverterModal;
