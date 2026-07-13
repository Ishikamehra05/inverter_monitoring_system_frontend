"use client";
import { useState } from "react";
import ChartTab from "./ChartTab";
import InformationTab, { Stat } from "./InformationTab";
import LogsTab, { Log } from "./LogsTab";
import AlertsTab from "./AlertsTab";
import { useSearchParams } from "next/navigation";
import { useDeviceInformation, useDeviceChart } from "@/hooks/api/useDevices";

// ---------- Types ----------

type DeviceTabPanelProps = {
  className?: string;
  onTabChange?: (tab: string) => void;
  deviceId?: string;
  plantId?: string;
  fromService?: boolean;
};



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
    { id: "information", label: "Information" },
    { id: "logs", label: "Logs" },
    { id: "alerts", label: "Current Alerts" },
  ];

  return (
    <div className="tabs relative flex gap-2 border-b border-gray-200 pb-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-6 py-2 text-md rounded-md transition-all duration-300 cursor-pointer
              ${isActive
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

// ---------- Main Component ----------
const DevicesTabPanel = ({
  className = "",
  onTabChange,
  deviceId: propDeviceId,
  plantId: propPlantId,
  fromService: propFromService,
}: DeviceTabPanelProps) => {
  const [activeTab, setActiveTab] = useState<string>("chart");
  const [chartDate, setChartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("targetEndUserId");

  const serviceParams =
    selectedEndUserId
      ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
      : propFromService ? { fromService: true } : {};

  const plantId = propPlantId ?? (searchParams.get("plantId") ?? "");
  const rawDeviceId = searchParams.get("deviceId") ?? "";

  const urlDeviceId =
    rawDeviceId.startsWith("device-")
      ? rawDeviceId.replace("device-", "")
      : rawDeviceId;

  const deviceId = propDeviceId ?? urlDeviceId;

  const { data, isLoading } = useDeviceInformation(
    deviceId,
    plantId,
    serviceParams
  );


  const deviceInfo = data;

  const basicStats: Stat[] =
    deviceInfo?.basicStats?.map((item) => ({
      label: item.label,
      value: item.value,
    })) ?? [];

  const stringStats: Stat[] =
    deviceInfo?.stringStats?.map((item) => ({
      label: item.label,
      value: item.value,
    })) ?? [];

  // console.log("device information", data);
  // console.log("basicStats", basicStats);
  // console.log("stringStats", stringStats);

  const [chartRange, setChartRange] =
    useState<"day" | "month" | "year">("day");

  const { data: chartData } = useDeviceChart(
    deviceId,
    plantId,
    chartRange,
    chartDate,
    serviceParams
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className={`device-tab-panel w-full mx-auto px-3 pt-4 pb-36 ${className}`}
    >
      <Tabs activeTab={activeTab} onChange={handleTabChange} />

      <div className="mt-2">
        {activeTab === "chart" && (
          <ChartTab
            chartDate={chartDate}
            setChartDate={setChartDate}
            range={chartRange}
            setRange={setChartRange}
            chartData={chartData}
            plantId={plantId}
            deviceId={deviceId}
          />
        )}

        {activeTab === "information" && (
          <InformationTab
            basicStats={basicStats}
            stringStats={stringStats}
            deviceId={deviceId}
            plantId={plantId}
            dateFrom={today}
            dateTo={today}
          />
        )}

        {activeTab === "logs" && <LogsTab
          deviceId={deviceId}
          plantId={plantId}
        />}

        {activeTab === "alerts" && <AlertsTab alerts={[]} />}
      </div>
    </div>
  );
};

export default DevicesTabPanel;
