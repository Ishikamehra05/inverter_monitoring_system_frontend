"use client";

import { X } from "lucide-react";

type DeleteConfirmationModalProps = {
  accountName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function DeleteConfirmationModal({
  accountName,
  onClose,
  onConfirm,
  isLoading,
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center sm:items-start sm:pt-[200px]">
      <div className="w-[90%] sm:w-[400px] bg-white rounded-xl shadow-lg flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[rgba(0,0,0,0.06)] flex justify-between items-center bg-white z-10 rounded-t-xl">
          <h2 className="text-[16px] sm:text-[18px] font-medium text-[rgba(0,0,0,0.85)]">
            Delete Subaccount
          </h2>
          <X
            size={20}
            onClick={isLoading ? undefined : onClose}
            className={`cursor-pointer text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)] ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
          />
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-6 text-[14px] leading-[1.5715] text-[rgba(0,0,0,0.85)]">
          <p>
            Are you sure you want to delete <strong>{accountName}</strong>? This
            action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-[rgba(0,0,0,0.06)] bg-white rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto h-[38px] px-5 border border-[#d9d9d9] rounded-[4px] bg-white hover:border-[#40a9ff] hover:text-[#40a9ff] transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto h-[38px] px-5 rounded-[4px] bg-[#ff4d4f] text-white hover:bg-[#ff7875] transition disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
