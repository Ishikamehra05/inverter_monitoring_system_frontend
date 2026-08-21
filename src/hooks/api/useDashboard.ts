"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { isBackendUnavailable } from "@/lib/api/errors";

export const dashboardKeys = {
  all: ["dashboard"] as const,

  plantOverview: (plantId: string, params: Record<string, unknown>,) =>
    [...dashboardKeys.all, "plantOverview", plantId, params] as const,

  plantInformation: (plantId: string) =>
    [...dashboardKeys.all, "plantInformation", plantId] as const,

  plantChart: (plantId: string, params: Record<string, unknown>,) =>
    [...dashboardKeys.all, "plantChart", plantId, params] as const,

  plantChartExport: (plantId: string, params: Record<string, unknown>,) =>
    [...dashboardKeys.all, "plantChartExport", plantId, params,] as const,

  currentAlerts: (
    plantId: string,
    params: Record<string, unknown>
  ) =>
    [...dashboardKeys.all, "currentAlerts", plantId, params] as const,
};

/* ---------------- Overview ---------------- */

export const usePlantOverview = (
  plantId: string,
  params?: Record<string, unknown>,
) =>
  useQuery({
    queryKey: dashboardKeys.plantOverview(
      plantId,
      params ?? {},
    ),

    queryFn: () =>
      dashboardApi.plantOverview(
        plantId,
        params ?? {},
      ),

    enabled: !!plantId,
  });
/* ---------------- Information ---------------- */

export const usePlantInformation = (
  plantId = "TODO_PLANT_ID",
  params: Record<string, unknown> = {},
) =>
  useQuery({
    queryKey:
      dashboardKeys.plantInformation(
        plantId,
      ),

    queryFn: async () => {
      try {
        return await dashboardApi.plantInformation(
          plantId,
          params
        );
      } catch (error) {
        if (!isBackendUnavailable(error))
          throw error;

        throw error;
      }
    },

    enabled: !!plantId,
  });

/* ---------------- Chart ---------------- */

export const usePlantChart = (
  plantId = "TODO_PLANT_ID",
  params: Record<string, unknown>,
) =>
  useQuery({
    queryKey: dashboardKeys.plantChart(
      plantId,
      params,
    ),

    queryFn: async () => {
      try {
        return await dashboardApi.plantChart(
          plantId,
          params,
        );
      } catch (error) {
        if (!isBackendUnavailable(error))
          throw error;

        throw error;
      }
    },

    enabled: !!plantId,
  });

export const useAnalysisDevices = (
  plantId: string,
  params: Record<string, unknown> = {},
) =>
  useQuery({
    queryKey: [
      "analysis-devices",
      plantId,
    ],

    queryFn: () =>
      dashboardApi.analysisDevices(
        plantId,
        params
      ),

    enabled: !!plantId,
  });

export const useAnalysisParameters = (
  plantId: string,
  deviceId: string,
  date: string,
  params: Record<string, unknown> = {},
) =>
  useQuery({
    queryKey: [
      "analysis-params",
      plantId,
      deviceId,
      date,
      params
    ],

    queryFn: () =>
      dashboardApi.analysisParameters(
        plantId,
        deviceId,
        date,
        params
      ),

    enabled:
      !!plantId &&
      !!deviceId,
  });

export const useAnalysisChart = (
  plantId: string,
  deviceId: string,
  date: string,
  parameters: string[],
  serviceParams: Record<string, unknown> = {},
) =>
  useQuery({
    queryKey: [
      "analysis-chart",
      plantId,
      deviceId,
      date,
      parameters,
      serviceParams,
    ],

    queryFn: () =>
      dashboardApi.analysisChart(
        plantId,
        {
          deviceId,
          date,
          parameters:
            parameters.join(","),
          ...serviceParams,
        }
      ),

    enabled:
      !!deviceId &&
      parameters.length > 0,
  });

export const usePlantChartExport = () =>
  useMutation({
    mutationFn: ({
      plantId,
      params,
    }: {
      plantId: string;
      params: Record<string, unknown>;
    }) =>
      dashboardApi.plantChartExport(
        plantId,
        params,
      ),
  });

export const usePlantCurrentAlerts = (
  plantId: string,
  params: Record<string, unknown> = {}
) =>
  useQuery({
    queryKey: dashboardKeys.currentAlerts(plantId, params),
    queryFn: () =>
      dashboardApi.plantCurrentAlerts(plantId, params),
    enabled: !!plantId,
  });