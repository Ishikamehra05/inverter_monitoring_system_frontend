"use client";

import { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import TaskDetailSidebar from "@/components/services/TaskDetailSidebar";
import CreateTaskPanel from "@/components/services/CreateTaskPanel";
import { useUpgradeTasks } from "@/hooks/api/useService";

const PAGE_SIZE = 10;

const tasks = [
  {
    id: 1,
    name: "Polycab Rocket 50pcs",
    status: "Finished",
    created: "2026-01-13 11:25:12",
    begin: "2026-01-13 11:19:11",
  },
  {
    id: 2,
    name: "1105",
    status: "Failed",
    created: "2025-11-05 07:45:40",
    begin: "2025-11-05 07:40:31",
  },
  {
    id: 3,
    name: "Batman II 03",
    status: "Finished",
    created: "2025-04-08 07:35:36",
    begin: "2025-04-08 07:32:57",
  },
];

export default function BatchTaskPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const tasksQuery = useUpgradeTasks({ page: currentPage, pageSize: PAGE_SIZE });
  const taskItems = tasksQuery.data?.items ?? tasks;

  const totalPages =
    tasksQuery.data?.pagination.totalPages ?? Math.ceil(tasks.length / PAGE_SIZE);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-[14px] text-[rgba(0,0,0,0.65)] whitespace-nowrap">
            Task Name :
          </span>

          <input
            className="h-8 px-2.75 rounded-xs border border-[#d9d9d9] w-full sm:w-72 text-[14px] focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition"
            placeholder="Please enter"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="w-full sm:w-auto px-4 h-8 text-[14px] rounded-xs border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#1890ff] hover:text-[#1890ff] transition">
            Reset
          </button>

          <button className="w-full sm:w-auto px-5 h-8 text-[14px] rounded-xs border border-[#1890ff] bg-[#1890ff] text-white hover:bg-[#40a9ff] hover:border-[#40a9ff] transition">
            Query
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 overflow-hidden">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[16px] font-medium text-[rgba(0,0,0,0.85)]">
            Upgrade Task List
          </h2>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 h-8 text-[14px] rounded-xs bg-[#1890ff] text-white hover:bg-[#40a9ff] transition"
            >
              + Create Task
            </button>

            <RefreshCw
              size={18}
              className="cursor-pointer text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)] transition"
            />
          </div>
        </div>

        {/* DESKTOP TABLE */}
        {tasksQuery.isLoading && (
          <div className="py-6 text-center text-[rgba(0,0,0,0.45)]">
            Loading tasks...
          </div>
        )}
        {tasksQuery.isError && (
          <div className="py-6 text-center text-[#ff4d4f]">
            Unable to load tasks.
          </div>
        )}
        <div className="hidden lg:block overflow-x-auto border border-[#f0f0f0] rounded-lg">
          <table className="min-w-[900px] w-full text-[14px]">
            <thead className="bg-[#fafafa] text-[rgba(0,0,0,0.65)]">
              <tr>
                <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                  Task Name
                </th>
                <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                  Task Status
                </th>
                <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                  Created Time
                </th>
                <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                  Begin Time
                </th>
                <th className="px-6 py-3 text-right border-b border-[rgba(0,0,0,0.06)]">
                  Operation
                </th>
              </tr>
            </thead>

            <tbody>
              {taskItems.map((task) => (
                <tr key={task.id} className="hover:bg-[#fafafa] transition">
                  <td
                    onClick={() => setSelectedTask(task)}
                    className="px-6 py-4  border-b border-[rgba(0,0,0,0.06)] text-[#1890ff] cursor-pointer hover:underline truncate max-w-[240px]"
                  >
                    {task.name}
                  </td>

                  <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                    <StatusBadge status={task.status} />
                  </td>

                  <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] whitespace-nowrap">
                    {task.created}
                  </td>

                  <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] whitespace-nowrap">
                    {task.begin}
                  </td>

                  <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] text-right">
                    <Trash2
                      size={16}
                      className="text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] cursor-pointer transition"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden p-4 space-y-4">
          {taskItems.map((task) => (
            <div
              key={task.id}
              className="border border-[rgba(0,0,0,0.06)] rounded-[2px] p-4 space-y-3"
            >
              <div
                onClick={() => setSelectedTask(task)}
                className="font-medium text-[#1890ff] cursor-pointer break-words"
              >
                {task.name}
              </div>

              <Info label="Status">
                <StatusBadge status={task.status} />
              </Info>

              <Info label="Created Time">{task.created}</Info>

              <Info label="Begin Time">{task.begin}</Info>

              <div className="flex justify-end pt-2">
                <Trash2 size={18} className="text-[#ff4d4f] cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center sm:justify-end px-6 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {selectedTask && (
        <TaskDetailSidebar
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {showCreate && <CreateTaskPanel onClose={() => setShowCreate(false)} />}
    </div>
  );
}

/* STATUS BADGE */
function StatusBadge({ status }: { status: string }) {
  const isFinished = status === "Finished";

  return (
    <div className="flex items-center gap-2 text-[14px]">
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

function Info({ label, children }: any) {
  return (
    <div className="text-[14px]">
      <div className="text-[12px] text-[rgba(0,0,0,0.45)]">{label}</div>
      <div className="break-words text-[rgba(0,0,0,0.85)]">{children}</div>
    </div>
  );
}
