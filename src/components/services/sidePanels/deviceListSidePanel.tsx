"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { X, RefreshCw, Download, Calendar, ChevronDown, Inbox } from "lucide-react";
import { useDeviceInformationExport, useDeviceLogsExport, useDeviceLogs, useDeviceChart, useDeviceChartExport } from "@/hooks/api/useDevices";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import ChartTab from "@/components/monitors/components/deviceDetails/ChartTab";

interface DeviceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName?: string;
}

interface DeviceListSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName?: string;
  deviceId: string;
  plantId: string;
  targetEndUserId?: string;
  basicStats: {
    label: string;
    value: string;
  }[];
  stringStats: {
    label: string;
    value: string;
  }[];
  loading?: boolean;
}

type Tab = "information" | "chart" | "logs" | "alerts";
type ChartPeriod = "Day" | "Month" | "Year";
type LogFilter = "All" | "Fault" | "Warn";

const LOG_OPTIONS = [
  "All",
  "A0-Grid over voltage",
  "A1-Grid under voltage",
  "A2-Grid absent",
  "A3-Grid over frequency",
  "A4-Grid under frequency",
  "B0-PV over voltage",
  "B1-PV insulation abnormal",
];

function NoData() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Inbox size={48} strokeWidth={1} className="mb-2 text-gray-300" />
      <span className="text-sm">No data</span>
    </div>
  );
}

// ─── Generate sample power data ────────────────────────────────────────────
function generateDayData() {
  const data: { time: string; power: number | null }[] = [];
  for (let h = 0; h <= 23; h++) {
    for (let m = 0; m < 60; m += 10) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      // Solar bell curve: ramps up 06:00–12:00, down 12:00–18:00, zero otherwise
      let power: number | null = null;
      if (h >= 6 && h <= 18) {
        const t = h + m / 60;
        const peak = 12;
        const sigma = 3;
        power = parseFloat(
          (4.5 * Math.exp(-0.5 * Math.pow((t - peak) / sigma, 2)) + Math.random() * 0.15).toFixed(2)
        );
      }
      data.push({ time, power });
    }
  }
  return data;
}

function generateMonthData() {
  const data: { time: string; power: number | null }[] = [];
  for (let d = 1; d <= 28; d++) {
    const power = parseFloat((Math.random() * 30 + 10).toFixed(2));
    data.push({ time: `Feb ${d}`, power });
  }
  return data;
}

function generateYearData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((m) => ({
    time: m,
    power: parseFloat((Math.random() * 300 + 100).toFixed(2)),
  }));
}

// Custom tooltip matching the production design
const PowerTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0]?.value;
    return (
      <div className="bg-white border border-gray-200 rounded shadow-md px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
        <div className="font-medium mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1890FF] inline-block flex-shrink-0" />
          <span>Power</span>
          <span className="text-gray-500 font-medium">{val != null ? `${val} kW` : "-- kW"}</span>
        </div>
      </div>
    );
  }
  return null;
};

interface ChartTabProps {
  chartPeriod: ChartPeriod;
  setChartPeriod: (p: ChartPeriod) => void;
  chartDate: string;
}

// function ChartTab({ chartPeriod, setChartPeriod, chartDate }: ChartTabProps) {
//   const data = useMemo(() => {
//     if (chartPeriod === "Day") return generateDayData();
//     if (chartPeriod === "Month") return generateMonthData();
//     return generateYearData();
//   }, [chartPeriod]);

//   // Tick interval for x-axis
//   const tickInterval = chartPeriod === "Day" ? 5 : 0; // every 5 × 10min = 1hr for Day

//   return (
//     <div className="border border-gray-200 rounded-lg p-5">
//       {/* Top bar */}
//       <div className="flex items-center justify-between mb-4">
//         <span className="text-base font-medium text-gray-800">Chart</span>
//         <div className="flex items-center gap-2">
//           {/* Period toggle */}
//           <div className="flex rounded overflow-hidden border border-gray-200 text-sm">
//             {(["Day", "Month", "Year"] as ChartPeriod[]).map((p) => (
//               <button
//                 key={p}
//                 onClick={() => setChartPeriod(p)}
//                 className={`px-4 py-1.5 transition-colors ${chartPeriod === p
//                   ? "bg-[#1890FF] text-white"
//                   : "bg-white text-gray-600 hover:bg-gray-50"
//                   }`}
//               >
//                 {p}
//               </button>
//             ))}
//           </div>
//           {/* Date */}
//           <div className="flex items-center gap-1.5 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
//             <span>{chartDate}</span>
//             <Calendar size={14} className="text-gray-400" />
//           </div>
//         </div>
//       </div>

//       {/* Download + Y-label row */}
//       <div className="flex items-center justify-between mb-1">
//         <span className="text-xs text-gray-500">Power</span>
//         <button className="text-gray-400 hover:text-gray-600 transition-colors">
//           <Download size={15} />
//         </button>
//       </div>

//       {/* Chart */}
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
//           <XAxis
//             dataKey="time"
//             tick={{ fontSize: 11, fill: "#9ca3af" }}
//             tickLine={false}
//             axisLine={{ stroke: "#e5e7eb" }}
//             interval={tickInterval}
//           />
//           <YAxis
//             tick={{ fontSize: 11, fill: "#9ca3af" }}
//             tickLine={false}
//             axisLine={false}
//             width={45}
//             tickFormatter={(v) => `${v}`}
//           />
//           <Tooltip
//             content={<PowerTooltip />}
//             cursor={{ stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "4 2" }}
//           />
//           <Line
//             type="monotone"
//             dataKey="power"
//             stroke="#1890FF"
//             strokeWidth={2}
//             dot={false}
//             activeDot={{ r: 4, fill: "#1890FF", stroke: "#fff", strokeWidth: 2 }}
//             connectNulls={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

interface InfoField {
  label: string;
  value: string;
}

interface InfoSection {
  title: string;
  fields: InfoField[];
}


function CollapsibleSection({ title, fields }: InfoSection) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-none">
      {/* Section header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-left"
      >
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform ${open ? "" : "-rotate-90"}`}
        />
        {title}
      </button>

      {open && (
        <div className="p-5">
          <div className="grid grid-cols-4 gap-x-6 gap-y-6">
            {fields.map((f) => (
              <div key={f.label}>
                <div className="text-sm font-semibold text-gray-800 leading-snug">{f.label}</div>
                <div className="text-sm text-gray-600 mt-0.5">{f.value || "\u00A0"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InformationTab({
  basicStats,
  stringStats,
  deviceId,
  plantId,
  targetEndUserId,
}: {
  basicStats: {
    label: string;
    value: string;
  }[];
  stringStats: {
    label: string;
    value: string;
  }[];
  deviceId: string;
  plantId: string;
  targetEndUserId?: string;
}) {
  const exportInformation = useDeviceInformationExport();
  const handleExport = async () => {
    try {
      const latestDate = new Date().toISOString().split("T")[0];

      const csv = await exportInformation.mutateAsync({
        deviceId,
        params: {
          plantId,
          dateFrom: latestDate,
          dateTo: latestDate,
          format: "csv",
          fromService: true,
          targetEndUserId,
        },
      });

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `device-information-${latestDate}.csv`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Information export failed", error);
    }
  };
  return (
    <div>
      {/* Top bar: date range + download */}
      <div className="flex justify-end items-center gap-3 mb-4">
        {/* <div className="flex items-center gap-1.5 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
          <span>2026-02-23</span>
          <span className="text-gray-400 mx-1">→</span>
          <span>2026-02-23</span>
          <Calendar size={14} className="text-gray-400 ml-1" />
        </div> */}
        <button
          onClick={handleExport}
          disabled={exportInformation.isPending}
          className="flex items-center gap-2 bg-[#1890FF] hover:bg-[#40a9ff] text-white text-sm font-medium px-4 py-1.5 rounded transition-colors">
          Download
        </button>
      </div>

      {/* Collapsible sections */}
      <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
        <CollapsibleSection
          title="Basic Info"
          fields={basicStats}
        />

        <CollapsibleSection
          title="String Info"
          fields={stringStats}
        />
      </div>
    </div>
  );
}

export default function DeviceSidebar({
  isOpen,
  onClose,
  deviceName,
  deviceId,
  plantId,
  targetEndUserId,
  basicStats,
  stringStats,
}: DeviceListSidePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("information");
  const [chartDate, setChartDate] = useState(new Date().toISOString().split("T")[0]);
  const [chartRange, setChartRange] = useState<"day" | "month" | "year">("day");
  const [logFilter, setLogFilter] = useState<LogFilter>("All");
  const [logDropdownOpen, setLogDropdownOpen] = useState(false);
  const [selectedLogOption, setSelectedLogOption] = useState("All");
  const [showCalendar, setShowCalendar] = useState(false);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date("2026-05-30"),
      endDate: new Date(),
      key: "selection",
    },
  ]);


  const logsQuery = useDeviceLogs(deviceId, {
    plantId,
    page: 1,
    pageSize: 10,
    event: selectedLogOption,
    dateFrom: dateRange[0].startDate?.toISOString().split("T")[0],
    dateTo: dateRange[0].endDate?.toISOString().split("T")[0],
    fromService: true,
    targetEndUserId,
  });

  const logsExport = useDeviceLogsExport();
  const logs =
    logsQuery.data?.items?.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      sn: item.sn,
      time: item.time,
      status: item.status,
      event: item.event,
    })) ?? [];


  const tabs: { key: Tab; label: string }[] = [
    { key: "information", label: "Information" },
    { key: "chart", label: "Chart" },
    { key: "logs", label: "Logs" },
    { key: "alerts", label: "Current Alerts" },
  ];

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const handleLogsExport = () => {
    const params = new URLSearchParams({
      plantId,
      event: selectedLogOption,
      dateFrom: formatDate(dateRange[0].startDate),
      dateTo: formatDate(dateRange[0].endDate),
      format: "csv",
      ...(targetEndUserId && {
        fromService: "true",
        targetEndUserId,
      }),
    });

    window.open(
      `/api/v1/monitor/devices/${deviceId}/logs/export?${params.toString()}`,
      "_blank"
    );
  };

  const chartQuery = useDeviceChart(
    deviceId,
    plantId,
    chartRange,
    chartDate,
    {
      fromService: true,
      targetEndUserId,
    }
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed top-0 right-0 h-full w-[75%] bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50 sidebar-slide-right flex flex-col">

        {/* Header: device name + close */}
        <div className="px-8 pt-8 pb-6 flex items-start justify-between border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">{deviceName}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-5 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.key
                ? "text-[#1890FF] border-b-2 border-[#1890FF]"
                : "text-gray-600 hover:text-[#1890FF]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 px-8 py-6">

          {/* ── INFORMATION ── */}
          {activeTab === "information" && (
            <InformationTab
              basicStats={basicStats}
              stringStats={stringStats}
              deviceId={deviceId}
              plantId={plantId}
              targetEndUserId={targetEndUserId}
            />
          )}

          {/* ── CHART ── */}
          {activeTab === "chart" && (
            <ChartTab
              chartDate={chartDate}
              setChartDate={setChartDate}
              range={chartRange}
              setRange={setChartRange}
              chartData={chartQuery.data}
              deviceId={deviceId}
              plantId={plantId}
            />
          )}

          {/* ── LOGS ── */}
          {activeTab === "logs" && (
            <div className="border border-gray-200 rounded-lg p-5">
              {/* Header row */}
              {/* Controls */}
              <div className="flex flex-wrap gap-2 items-center justify-end mb-5">
                {/* Date Range */}
                <div className="relative">
                  <input
                    readOnly
                    onClick={() => setShowCalendar(!showCalendar)}
                    value={`${dateRange[0].startDate?.toLocaleDateString()} — ${dateRange[0].endDate?.toLocaleDateString()}`}
                    className="border border-gray-200 rounded px-3 py-2 cursor-pointer text-sm w-[240px]"
                  />

                  {showCalendar && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-lg z-50">
                      <DateRange
                        ranges={dateRange}
                        onChange={(ranges: any) => {
                          setDateRange([ranges.selection]);
                        }}
                        moveRangeOnFirstSelection={false}
                      />

                      <div className="flex justify-end gap-2 p-3 border-t">
                        <button
                          onClick={() => setShowCalendar(false)}
                          className="px-4 py-1.5 border rounded text-sm"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={() => {
                            setShowCalendar(false);
                            logsQuery.refetch();
                          }}
                          className="px-4 py-1.5 bg-[#1890FF] text-white rounded text-sm"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Filter */}
                <select
                  value={selectedLogOption}
                  onChange={(e) => setSelectedLogOption(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-2 text-sm"
                >
                  <option value="All">All</option>
                  {LOG_OPTIONS.filter((o) => o !== "All").map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {/* Download */}
                <button
                  onClick={handleLogsExport}
                  disabled={logsExport.isPending}
                  className="flex items-center gap-2 bg-[#1890FF] hover:bg-[#40a9ff] text-white text-sm font-medium px-4 py-2 rounded"
                >
                  <Download size={15} />
                  {logsExport.isPending ? "Downloading..." : "Download"}
                </button>
              </div>

              {/* No data */}
              {logsQuery.isLoading ? (
                <div className="py-10 text-center text-gray-500">
                  Loading...
                </div>
              ) : logs.length === 0 ? (
                <NoData />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left">Time</th>
                      <th className="px-4 py-3 text-left">Level</th>
                      <th className="px-4 py-3 text-left">Event</th>
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log: any) => (
                      <tr key={log.id} className="border-b border-gray-100">
                        <td>{log.time}</td>
                        <td>{log.status}</td>
                        <td>{log.event}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── CURRENT ALERTS ── */}
          {activeTab === "alerts" && (
            <div className="border border-gray-200 rounded-lg">
              {/* Refresh button */}
              <div className="flex justify-end px-4 pt-3 pb-1">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* Table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-b border-gray-200 bg-gray-50">
                    <th className="px-5 py-3 text-left text-gray-600 font-medium">Name</th>
                    <th className="px-5 py-3 text-left text-gray-600 font-medium">SN</th>
                    <th className="px-5 py-3 text-left text-gray-600 font-medium">Event</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3}>
                      <NoData />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sidebar-slide-right {
          animation: slideInRight 0.25s ease-out;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}