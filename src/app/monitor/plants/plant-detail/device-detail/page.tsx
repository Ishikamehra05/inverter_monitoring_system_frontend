"use client";

import { useState } from "react";
import DevicesTabPanel from "@/components/monitors/components/deviceDetails/DevicesTabPanel";
import DeviceOverview from "@/components/monitors/components/deviceDetails/DeviceOverview";
import { useDeviceView } from "@/hooks/api/useDevices";
import { useSearchParams } from "next/navigation";

export default function DeviceDetailsPage() {
  const [activeTab, setActiveTab] = useState<string>("chart");
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("targetEndUserId");

  const serviceParams =
    selectedEndUserId
      ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
      : {};
  const rawDeviceId = searchParams.get("deviceId") ?? "";

  const deviceId = rawDeviceId.startsWith("device-") ? rawDeviceId.replace("device-", "") : rawDeviceId;
  const plantId = searchParams.get("plantId") ?? "";
  const { data, isLoading } = useDeviceView(deviceId, plantId, serviceParams);

  // console.log("deviceid", deviceId, plantId)
  const device = data;
  // console.log("Passing latestUpdate:", device?.latestUpdate);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col p-4 md:p-6 rounded-lg gap-6">
      <div className="bg-white p-6 rounded-lg">
        <DeviceOverview
          name={device?.name ?? "-"}
          status={device?.status ?? "offline"}
          currentPower={device?.currentPower ?? 0}
          todayEnergy={device?.eToday ?? 0}
          totalEnergy={device?.eTotal ?? 0}
          hours={device?.hTotal ?? 0}
          lastUpdate={
            device?.latestUpdate
              ? new Date(device.latestUpdate).toLocaleString("en-IN", {
                timeZone: "UTC",
              })
              : "-"
          }
        />;
      </div>

      <DevicesTabPanel
        className="bg-white p-6 rounded-lg"
        onTabChange={setActiveTab}
      />
    </div>
  );
}
