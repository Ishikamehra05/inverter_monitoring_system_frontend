"use client";

export type Alert = {
  name: string;
  sn: string;
  event: string;
};

type AlertsTabProps = {
  alerts: Alert[];
};

const AlertsTab = ({ alerts }: AlertsTabProps) => {
  return (
    <div className="mt-4 bg-white border rounded-lg overflow-hidden">
      {alerts.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            className="mb-2"
          >
            <path
              d="M3 7h18M5 7l1-3h12l1 3M6 7v10a2 2 0 002 2h8a2 2 0 002-2V7"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
          <span className="text-sm">No data</span>
        </div>
      ) : (
        <table className="w-full border-collapse text-sm text-black">
          {/* Header */}
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                S/N
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Event
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {alerts.map((item, idx) => (
              <tr
                key={idx}
                className="border-b last:border-b-0 whitespace-nowrap border-gray-300 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 text-blue-600 cursor-pointer hover:underline">
                  {item.name}
                </td>
                <td className="px-4 py-3">{item.sn}</td>
                <td className="px-4 py-3 text-gray-700">{item.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AlertsTab;
