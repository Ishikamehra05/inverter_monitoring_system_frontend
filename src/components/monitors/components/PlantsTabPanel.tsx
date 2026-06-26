"use client";
import { useState, useMemo } from "react";
import ChartTab from "./ChartTab";
import type { Device } from "./DeviceTab";
import DeviceTab from "./DeviceTab";
import InformationTab, { Stat } from "./InformationTab";
import LogsTab, { Log } from "./LogsTab";
import AnalysisTab from "./AnalysisTab";

// ---------- Types ----------

type DeviceTabPanelProps = {
  className?: string;
};

// ---------- Sample Dynamic Data (can later come from API) ----------
const initialDevices: Device[] = [
  {
    id: 1,
    name: "PSIT-125K-SM18 1252432-09680003",
    type: "PSIT-125K-SM18",
    sn: "1252432-09680003",
    power: 48.28,
    today: 61.0,
    total: 235.87,
    hours: 5.01,
    online: true,
  },
  {
    id: 2,
    name: "PSIT-125K-SM18 1252433-09630027",
    type: "PSIT-125K-SM18",
    sn: "1252433-09630027",
    power: 45.75,
    today: 56.0,
    total: 224.75,
    hours: 5.01,
    online: true,
  },
  {
    id: 3,
    name: "PSIT-125K-SM18 1252433-09630089",
    type: "PSIT-125K-SM18",
    sn: "1252433-09630089",
    power: 38.69,
    today: 47.0,
    total: 214.12,
    hours: 5.01,
    online: true,
  },
  {
    id: 4,
    name: "PSIT-25K-SM4 2425-07520365P",
    type: "PSIT-25K-SM4",
    sn: "2425-07520365P",
    power: 8.35,
    today: 9.0,
    total: 41.57,
    hours: 4.94,
    online: true,
  },
];

const initialLogs: Log[] = [
  {
    id: 1,
    name: "PSIT-125K-SM18 1252433-09630027",
    type: "PSIT-125K-SM18",
    sn: "1252433-09630027",
    time: "2026-02-03 15:41:31 (UTC +5.5)",
    status: "Inactive",
    event: "A1-Grid under voltage",
  },
  {
    id: 2,
    name: "PSIT-125K-SM18 1252433-09630027",
    type: "PSIT-125K-SM18",
    sn: "1252433-09630027",
    time: "2026-02-03 15:41:31 (UTC +5.5)",
    status: "Inactive",
    event: "A4-Grid under frequency",
  },
  {
    id: 3,
    name: "PSIT-125K-SM18 1252433-09630027",
    type: "PSIT-125K-SM18",
    sn: "1252433-09630027",
    time: "2026-02-03 15:41:29 (UTC +5.5)",
    status: "Inactive",
    event: "A2-Grid absent",
  },
  {
    id: 4,
    name: "PSIT-125K-SM18 1252433-09630089",
    type: "PSIT-125K-SM18",
    sn: "1252433-09630089",
    time: "2026-02-03 15:40:26 (UTC +5.5)",
    status: "Inactive",
    event: "A1-Grid under voltage",
  },
  {
    id: 5,
    name: "PSIT-125K-SM18 1252433-09630089",
    type: "PSIT-125K-SM18",
    sn: "1252433-09630089",
    time: "2026-02-03 15:40:26 (UTC +5.5)",
    status: "Inactive",
    event: "A4-Grid under frequency",
  },
];

const statsData: Stat[] = [
  {
    label: "Input Power",
    value: "146.57 kW",
    icon: "/images/information-tab/info-img-1.png",
  },
  {
    label: "CO₂",
    value: "383.95t",
    icon: "/images/information-tab/info-img-2.png",
  },
  {
    label: "Tree Planting",
    value: "1075",
    icon: "/images/information-tab/info-img-3.png",
  },
  {
    label: "Efficiency",
    value: "0.35",
    icon: "/images/information-tab/info-img-4.png",
  },
  {
    label: "Weather",
    value: "0.35",
    icon: "/images/information-tab/info-img-5.png",
  },
  {
    label: "Irradiance",
    value: "0.35",
    icon: "/images/information-tab/info-img-6.png",
  },
  {
    label: "Cell Temperature",
    value: "0.35",
    icon: "/images/information-tab/info-img-7.png",
  },
];
// ---------- UI Atoms ----------
const Tabs = ({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (id: string) => void;
}) => {
  const tabs = [
    { id: "chart", label: "Chart" },
    { id: "device", label: "Device" },
    { id: "information", label: "Information" },
    { id: "logs", label: "Logs" },
    { id: "analysis", label: "Analysis" },
    { id: "alerts", label: "Current Alerts" },
  ];

  return (
    <div className="tabs relative flex flex-wrap gap-2 border-b border-gray-200 pb-1.5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-6 py-2 text-md rounded-md transition-all duration-300 cursor-pointer
              ${
                isActive
                  ? "text-blue-600 font-medium"
                  : "text-gray-600 hover:text-blue-500"
              }
              hover:bg-blue-50 focus:outline-none`}
          >
            {tab.label}

            {/* Animated underline (NO extra UI) */}
            <span
              className={`absolute left-0 right-0 -bottom-1.5 h-0.5 bg-blue-600
    origin-left transform transition-transform duration-300
    ${isActive ? "scale-x-100" : "scale-x-0"}
  `}
            />
          </button>
        );
      })}
    </div>
  );
};

// ---------- Chart ----------
const PowerChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 0);

  // Make SVG responsive using viewBox + width:100%
  return (
    <div className="chart-area mt-4 w-full">
      <div className="chart-container w-full overflow-x-auto">
        <svg
          viewBox="0 0 800 350"
          className="chart-svg w-full h-auto"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0099ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0099ff" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path
            d={`M 60 310 ${data
              .map(
                (v, i) =>
                  `L ${60 + i * 14} ${310 - (max ? (v / max) * 250 : 0)}`,
              )
              .join(" ")} L 760 310 Z`}
            fill="url(#areaGradient)"
            stroke="#0099ff"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

// ---------- Alerts Tab ----------
const AlertsTab = () => {
  return (
    <div className="mt-4 space-y-4">
      <div className="controls flex justify-end">
        <button className="btn px-3 py-1 text-sm rounded-md bg-gray-100">
          🔄 Refresh
        </button>
      </div>
      <div className="empty-state flex flex-col items-center justify-center border border-dashed rounded-lg py-10 text-center">
        <div className="empty-icon text-3xl mb-2">📋</div>
        <div className="empty-text text-sm text-gray-500">No data</div>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
const PlantsTabPanel = ({ className = "" }: DeviceTabPanelProps) => {
  const [activeTab, setActiveTab] = useState<string>("chart");
  const [chartDate, setChartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [devices] = useState<Device[]>(initialDevices);
  const [logs] = useState<Log[]>(initialLogs);

  return (
    <div
      className={`device-tab-panel w-full mx-auto px-3 pt-4 pb-36 ${className}`}
    >
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-2">
        {activeTab === "chart" && (
          <ChartTab chartDate={chartDate} setChartDate={setChartDate} />
        )}

        {activeTab === "device" && <DeviceTab devices={devices} />}

        {activeTab === "information" && (
          <InformationTab
            installationDate="2024-12-29"
            capacity="500 kW"
            address="Gandhinagar"
            stats={statsData}
          />
        )}

        {activeTab === "logs" && <LogsTab logs={logs} />}

        {activeTab === "analysis" && (
          <AnalysisTab
            chartDate={chartDate}
            setChartDate={setChartDate}
            devices={devices}
          />
        )}

        {activeTab === "alerts" && <AlertsTab />}
      </div>
    </div>
  );
};

export default PlantsTabPanel;
