"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import EnergyFlow from "@/components/monitors/EnergyFlow/EnergyFlow";
import PlantsTabPanel from "@/components/monitors/components/plantDetails/PlantsTabPanel";
import PlantOverview from "@/components/monitors/components/plantDetails/PlantOverview";

import { usePlantOverview } from "@/hooks/api/useDashboard";

export default function PlantDetailsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] =
    useState<string>("chart");
  const plantId = searchParams.get("plantId");
  const targetEndUserId =
    searchParams.get("targetEndUserId");
  const fromService =
    searchParams.get("fromService");

  if (!plantId) {
    return <div>Plant ID not found</div>;
  }
  // console.log("plantId", plantId);
  // console.log(
  //   "targetEndUserId",
  //   searchParams.get("targetEndUserId")
  // );
  // console.log(
  //   "fromService",
  //   searchParams.get("fromService")
  // );

  const {
    data: overview,
    isLoading,
    error,
  } = usePlantOverview(plantId ?? "", {
    ...(fromService === "true" &&
      targetEndUserId && {
      fromService: true,
      targetEndUserId,
    }),
  });

  if (!plantId) {
    return <div>Plant ID not found</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Failed to load plant overview
      </div>
    );
  }

  if (!overview) {
    return <div>No data available</div>;
  }

  return (
    <div className="flex flex-col p-4 md:p-6 rounded-lg gap-6">

      <div className="rounded-lg">
        <PlantOverview
          name={overview.plant.name}
          type={overview.plant.type}
          // status={overview.plant.status}
          currentPower={
            overview.metrics.currentPower.value
          }
          todayEnergy={
            overview.metrics.eToday.value
          }
          totalEnergy={
            overview.metrics.eTotal.value
          }
          income={
            overview.plant.income.value
          }
          hours={
            overview.metrics.hTotal.value
          }
          capacity={
            overview.metrics.capacity.value
          }
          installDate={
            overview.plant.installationDate
          }
        />
      </div>

      {activeTab === "chart" && (
        <EnergyFlow
          solarPower={5.2}
          gridPower={-1.5}
          consumption={3.8}
          className="bg-(--theme-bg) p-6 rounded-lg"
        />
      )}

      <PlantsTabPanel
        plantId={plantId}
        className="bg-(--theme-bg) p-6 rounded-lg"
        onTabChange={setActiveTab}
      />
    </div>
  );
}