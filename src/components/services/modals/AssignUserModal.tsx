"use client";

export default function AssignUserModal({ onClose }: any) {
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
            <input className="w-full h-[44px] px-4 border border-[#d9d9d9] rounded-md focus:outline-none focus:border-[#1677ff]" />
          </div>

          <div>
            <label className="block mb-2 text-[16px] text-[#262626]">
              OSS User List
            </label>
            <select className="w-full h-[44px] px-4 border border-[#1677ff] rounded-md focus:outline-none">
              <option>Select user</option>
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

          <button className="h-10 px-6 text-white bg-[#1677ff] border border-[#1677ff] rounded shadow-[0_2px_0_rgba(0,0,0,0.045)] hover:bg-[#4096ff]">
            Assign User
          </button>
        </div>

      </div>
    </div>
  );
}
