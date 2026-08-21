"use client";

import { useRelateMonitorUser } from "@/hooks/api/useService";
import { useState } from "react";
import { toast } from "sonner";

export default function RelateUserModal({ onClose }: any) {
  const [account, setAccount] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  const relateMutation = useRelateMonitorUser();

  const handleRelate = async () => {
    const trimmedAccount = account.trim();
    const trimmedSerialNumber = serialNumber.trim();

    // Validation
    if (!trimmedAccount) {
      toast.error("Please enter monitor user.");
      return;
    }

    if (!trimmedSerialNumber) {
      toast.error("Please enter serial number.");
      return;
    }

    try {
      const res = await relateMutation.mutateAsync({
        account: trimmedAccount,
        serialNumber: trimmedSerialNumber,
      });

      toast.success(res.message || "User related successfully.");

      // Reset form
      setAccount("");
      setSerialNumber("");

      onClose();
    } catch (error: any) {
      console.error("Relate User Error:", error);

      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Failed to relate user.",
      );
    }
  };
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-[520px] bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h2 className="text-[22px] font-medium text-[#262626]">
            Relate User
          </h2>
          <button onClick={onClose} className="text-[#8c8c8c] text-xl">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          <input
            value={account}
            disabled={relateMutation.isPending}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="Please enter monitor user"
            className="w-full h-[44px] px-4 border border-[#d9d9d9] rounded-md focus:outline-none focus:border-[#1677ff]"
          />
          <input
            value={serialNumber}
            disabled={relateMutation.isPending}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="Please enter sn"
            className="w-full h-[44px] px-4 border border-[#d9d9d9] rounded-md focus:outline-none focus:border-[#1677ff]"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t border-[#f0f0f0]">
          <button
            onClick={onClose}
            disabled={relateMutation.isPending}
            className="h-10 px-6 border border-[#d9d9d9] rounded bg-white text-[#262626] hover:bg-[#f5f5f5]"
          >
            Cancel
          </button>

          <button
            onClick={handleRelate}
            disabled={relateMutation.isPending}
            className="h-10 px-6 text-white bg-[#1677ff] border border-[#1677ff] rounded shadow-[0_2px_0_rgba(0,0,0,0.045)] hover:bg-[#4096ff] disabled:opacity-50"
          >
            {relateMutation.isPending ? "Relating..." : "Relate"}
          </button>
        </div>
      </div>
    </div>
  );
}
