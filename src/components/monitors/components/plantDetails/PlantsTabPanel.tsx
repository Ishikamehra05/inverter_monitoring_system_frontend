"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ChartTab from "./ChartTab";
import type { Device } from "./DeviceTab";
import DeviceTab from "./DeviceTab";
import InformationTab, { Stat } from "./InformationTab";
import LogsTab, { Log } from "./LogsTab";
import AnalysisTab from "./AnalysisTab";
import AlertsTab from "./AlertsTab";
import { usePlantDevices } from "@/hooks/api/useDevices";
import { usePlantInformation } from "@/hooks/api/useDashboard";
// import { usePlantLogs } from "@/hooks/api/usePlants";

// ---------- Types ----------

type DeviceTabPanelProps = {
  className?: string;
  onTabChange?: (tab: string) => void;
  plantId: string;
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
    { id: "device", label: "Device" },
    { id: "information", label: "Information" },
    { id: "logs", label: "Logs" },
    { id: "analysis", label: "Analysis" },
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
const PlantsTabPanel = ({
  className = "",
  onTabChange,
  plantId,
}: DeviceTabPanelProps) => {
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("targetEndUserId");

  const serviceParams =
    selectedEndUserId
      ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
      : {};
  const [activeTab, setActiveTab] = useState<string>("chart");
  const [chartDate, setChartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const plantInfoQuery = usePlantInformation(plantId, serviceParams);
  const plantInfo = plantInfoQuery.data;
  // const [logs] = useState<Log[]>();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

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
            plantId={plantId}
          />
        )}

        {activeTab === "device" && <DeviceTab
          plantId={plantId}
        />}

        {activeTab === "information" && (

          <InformationTab
            installationDate={
              plantInfo?.installationDate ??
              "-"
            }

            capacity={
              plantInfo?.capacity ??
              "-"
            }

            address={
              plantInfo?.address ??
              "-"
            }

            stats={
              plantInfo?.stats?.map(
                (stat: any) => ({

                  label:
                    stat.label,

                  value:
                    stat.value,
                  icon:
                    stat.icon,

                })
              ) ?? []
            }

          />

        )}
        {/* {activeTab === "logs" && <LogsTab logs={logs} />} */}
        {activeTab === "logs" && (
          <LogsTab plantId={plantId} />
        )}


        {activeTab === "analysis" && (
          <AnalysisTab
            chartDate={chartDate}
            setChartDate={setChartDate}
            plantId={plantId}
          />
        )}
        {activeTab === "alerts" && <AlertsTab plantId={plantId} />}

        {/* {activeTab === "alerts" && <AlertsTab alerts={} />} */}
      </div>
    </div>
  );
};

export default PlantsTabPanel;
