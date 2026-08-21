"use client";

import { X } from "lucide-react";

type Props = {
  accountName: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const DeleteConfirmationModal = ({
  accountName,
  isLoading,
  onClose,
  onConfirm,
}: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-red-600">
            Delete Subaccount
          </h2>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="text-gray-600">
          Are you sure you want to delete
          <span className="font-semibold"> {accountName}</span>?
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;