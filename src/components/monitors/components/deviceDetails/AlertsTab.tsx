"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/monitors/pagination";
import { useDeviceCurrentAlerts } from "@/hooks/api/useDevices";

interface AlertsTabProps {
  deviceId: string;
  plantId: string;
}

const AlertsTab = ({ deviceId, plantId }: AlertsTabProps) => {
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

  const alertsQuery = useDeviceCurrentAlerts(deviceId, {
    plantId,
    page: currentPage,
    pageSize,
    ...serviceParams,
  });

  const alerts = alertsQuery.data?.items ?? [];
  console.log(alerts);

  return (
    <div className="p-6 space-y-6">
      {alertsQuery.isLoading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-md">
            <thead className="bg-gray-50 text-black">
              <tr className="whitespace-nowrap">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">S/N</th>
                <th className="px-4 py-3 text-left">Event</th>
              </tr>
            </thead>

            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-400"
                  >
                    No current alerts
                  </td>
                </tr>
              ) : (
                alerts.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap transition"
                  >
                    <td className="px-4 py-3 text-black">
                      {item.name}
                    </td>

                    <td className="px-4 py-3 text-black">
                      {item.sn}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-sm bg-blue-500 px-2 py-1 text-sm text-white">
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