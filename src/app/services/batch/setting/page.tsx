"use client";

import { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import CreateBatchSettingTaskPanel from "@/components/services/CreateBatchSettingTaskPanel";
import SettingTaskDetailPanel from "@/components/services/SettingTaskDetailPanel";

const tasks = [
  {
    id: 1,
    name: "Set3K6MaxPower-2501",
    status: "Failed",
    created: "2025-03-27 07:02:30",
  },
  {
    id: 2,
    name: "Set3K6MaxPower-2502",
    status: "Finished",
    created: "2025-03-27 06:50:17",
  },
];

export default function BatchSettingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div className="min-h-screen text-[rgba(0,0,0,0.85)] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* CARD */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] p-6 rounded-lg overflow-hidden shadow-sm space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-base sm:text-lg font-medium text-[rgba(0,0,0,0.85)]">
              Setting Task List
            </h2>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreate(true)}
                className="bg-[#1890ff] hover:bg-[#40a9ff] text-white text-sm px-4 py-2 rounded transition-colors duration-200"
              >
                + Create Task
              </button>

              <RefreshCw
                size={18}
                className="text-[rgba(0,0,0,0.45)] cursor-pointer hover:text-[rgba(0,0,0,0.85)] transition-colors"
              />
            </div>
          </div>

          {/* ---------- DESKTOP TABLE ---------- */}
          <div className="overflow-x-auto border border-[#f0f0f0] rounded-lg">
            <table className="min-w-[900px] w-full text-[14px]">
              <thead className="bg-[#fafafa] text-[rgba(0,0,0,0.65)]">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Task Name</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Task Status
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Created Time
                  </th>
                  <th className="px-6 py-3 text-right font-medium">
                    Operation
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-[#fafafa] transition-colors duration-200"
                  >
                    <td
                      onClick={() => setSelectedTask(task)}
                      className="px-6 py-4 text-[#1890ff] cursor-pointer hover:text-[#40a9ff]"
                    >
                      {task.name}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-[rgba(0,0,0,0.85)]">
                      {task.created}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Trash2
                        size={16}
                        className="text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] cursor-pointer transition-colors"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- MOBILE CARD VIEW ---------- */}
          <div className="lg:hidden p-4 space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-[rgba(0,0,0,0.06)] rounded-md p-4 space-y-3 hover:shadow-sm transition-shadow"
              >
                <div
                  onClick={() => setSelectedTask(task)}
                  className="font-medium text-[#1890ff] cursor-pointer hover:text-[#40a9ff]"
                >
                  {task.name}
                </div>

                <Info label="Status">
                  <StatusBadge status={task.status} />
                </Info>

                <Info label="Created Time">
                  <span className="text-[rgba(0,0,0,0.85)]">
                    {task.created}
                  </span>
                </Info>

                <div className="flex justify-end pt-2">
                  <Trash2
                    size={18}
                    className="text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] cursor-pointer transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-[rgba(0,0,0,0.45)]">
            <div>1-2 of 2 items</div>

            <Pagination
              currentPage={currentPage}
              totalPages={1}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* DETAIL PANEL */}
      {selectedTask && (
        <SettingTaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* CREATE PANEL */}
      {showCreate && (
        <CreateBatchSettingTaskPanel onClose={() => setShowCreate(false)} />
      )}
    </>
  );
}

/* ---------- HELPERS ---------- */

function StatusBadge({ status }: { status: string }) {
  const isFinished = status === "Finished";

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`w-2 h-2 rounded-full ${
          isFinished ? "bg-[#52c41a]" : "bg-[#ff4d4f]"
        }`}
      />
      <span className={isFinished ? "text-[#52c41a]" : "text-[#ff4d4f]"}>
        {status}
      </span>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="text-sm">
      <div className="text-xs text-[rgba(0,0,0,0.45)]">{label}</div>
      <div className="text-[rgba(0,0,0,0.85)]">{children}</div>
    </div>
  );
}
