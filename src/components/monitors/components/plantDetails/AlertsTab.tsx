"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/monitors/pagination";
import { usePlantCurrentAlerts } from "@/hooks/api/useDashboard";

type AlertsTabProps = {
  plantId: string;
};

const AlertsTab = ({ plantId }: AlertsTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const searchParams = useSearchParams();

  const selectedEndUserId = searchParams.get("targetEndUserId");

  const serviceParams = selectedEndUserId
    ? {
      fromService: true,
      targetEndUserId: selectedEndUserId,
    }
    : {};

  const alertsQuery = usePlantCurrentAlerts(plantId, {
    page: currentPage,
    pageSize,
    ...serviceParams,
  });

  const alerts = alertsQuery.data?.items ?? [];

  return (
    <div className="p-6 space-y-6">
      {alertsQuery.isLoading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full table-fixed text-sm text-black">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="w-2/5 px-4 py-3 text-left font-medium text-gray-700">
                  Name
                </th>

                <th className="w-1/4 px-4 py-3 text-left font-medium text-gray-700">
                  S/N
                </th>

                <th className="w-1/3 px-4 py-3 text-center font-medium text-gray-700">
                  Event
                </th>
              </tr>
            </thead>

            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-gray-400"
                  >
                    No current alerts
                  </td>
                </tr>
              ) : (
                alerts.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-300 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-4 text-blue-600 break-words">
                      {item.name}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.sn}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                        {item.event}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        totalItems={alertsQuery.data?.pagination?.totalItems ?? 0}
        pageSize={pageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default AlertsTab;