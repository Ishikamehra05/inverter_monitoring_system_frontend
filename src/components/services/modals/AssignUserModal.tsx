"use client";

import { useState } from "react";
import { useAssignMonitorUsers } from "@/hooks/api/useService";
import { useGetSubAccounts } from "@/hooks/api/useUsers";
import { toast } from "sonner";

export default function AssignUserModal({ onClose }: any) {
  const [monitorUserIdInput, setMonitorUserIdInput] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState("");

  const assignUsersMutation = useAssignMonitorUsers();
  const { data: ossUsers = [], isLoading: isLoadingOss } = useGetSubAccounts();

  const handleSubmit = async () => {
    if (!monitorUserIdInput.trim()) {
      toast.error("Please enter a monitor user ID");
      return;
    }
    if (!assignedToUserId) {
      toast.error("Please select an OSS user");
      return;
    }

    try {
      const monitorUserIds = monitorUserIdInput
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      await assignUsersMutation.mutateAsync({
        monitorUserIds,
        assignedToUserId,
      });
      toast.success("Monitor users assigned successfully.");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign users");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-[520px] bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h2 className="text-[22px] font-medium text-[#262626]">
            Assign User
          </h2>
          <button onClick={onClose} className="text-[#8c8c8c] text-xl">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          <div>
            <label className="block mb-2 text-[16px] text-[#262626]">
              Monitor User List
            </label>
            <input
              value={monitorUserIdInput}
              onChange={(e) => setMonitorUserIdInput(e.target.value)}
              placeholder="e.g. 3, 5"
              className="w-full h-[44px] px-4 border border-[#d9d9d9] rounded-md focus:outline-none focus:border-[#1677ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-[16px] text-[#262626]">
              OSS User List
            </label>
            <select
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
              className="w-full h-[44px] px-4 border border-[#1677ff] rounded-md focus:outline-none"
            >
              <option value="">Select user</option>
              {isLoadingOss ? (
                <option disabled>Loading users...</option>
              ) : (
                ossUsers.map((user: any) => (
                  <option
                    key={user.id || user.account}
                    value={user.id || user.account}
                  >
                    {user.account}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t border-[#f0f0f0]">
          <button
            onClick={onClose}
            className="h-10 px-6 border border-[#d9d9d9] rounded bg-white text-[#262626] hover:bg-[#f5f5f5]"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={assignUsersMutation.isPending}
            className="h-10 px-6 text-white bg-[#1677ff] border border-[#1677ff] rounded shadow-[0_2px_0_rgba(0,0,0,0.045)] hover:bg-[#4096ff] disabled:opacity-50"
          >
            {assignUsersMutation.isPending ? "Assigning..." : "Assign User"}
          </button>
        </div>
      </div>
    </div>
  );
}
