"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devicesApi, ServiceScopeParams } from "@/lib/api/devices";
import { isBackendUnavailable } from "@/lib/api/errors";
// import { DeviceLogsExportParams } from "@/lib/api/schemas/devices"
import { serviceKeys } from "./useService";
import {
  DeviceLogsExportParams,
  RemoteSettingsCommand,
  RemoteSettingsTabEntry,
  RemoteSettingsTabKey,
} from "@/lib/api/schemas/devices"

export const deviceKeys = {
  all: ["devices"] as const,
  plant: (plantId: string, params: Record<string, unknown>) =>
    [...deviceKeys.all, "plant", plantId, params] as const,
  detail: (deviceId: string) => [...deviceKeys.all, "detail", deviceId] as const,
  information: (deviceId: string) =>
    [...deviceKeys.all, "information", deviceId] as const,
  logs: (deviceId: string, params: Record<string, unknown>) =>
    [...deviceKeys.all, "logs", deviceId, params] as const,
  currentAlerts: (
    deviceId: string,
    params: Record<string, unknown>
  ) => [...deviceKeys.detail(deviceId), "current-alerts", params],
  remoteSettingsTab: (
    deviceId: string,
    tab: RemoteSettingsTabKey,
    params: Record<string, unknown>,
  ) => [...deviceKeys.all, "remoteSettingsTab", deviceId, tab, params] as const,
};

export const usePlantDevices = (
  plantId: string,
  params: Record<string, unknown> = {},
) =>
  useQuery({
    queryKey: deviceKeys.plant(plantId, params),
    queryFn: () => devicesApi.plantDevices(plantId, params),
  });

export const useAddInverter = (
  plantId: string,
  params: Record<string, unknown> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serialNumber: string) =>
      devicesApi.addInverter(plantId, { serialNumber }, params),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deviceKeys.all,
      });
    },
  });
};

export const useAddLogger = (plantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serialNumber: string) => {
      try {
        return await devicesApi.addLogger(plantId, { serialNumber });
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;
        return { deviceId: `dev_${serialNumber}` };
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
  });
};

export const useEditDevice = (
  plantId: string,
  params: Record<string, unknown> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deviceId,
      name,
    }: {
      deviceId: string;
      name: string;
    }) =>
      devicesApi.editDevice(
        deviceId,
        {
          plantId,
          name,
        },
        params,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deviceKeys.all,
      });
    },
  });
};

export const useDeleteDevice = (
  plantId: string,
  params: Record<string, unknown> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) =>
      devicesApi.deleteDevice(
        deviceId,
        {
          plantId,
          role: "end user",
          fromService: false,
        },
        params,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deviceKeys.all,
      });
    },
  });
};

export const useDeviceInformation = (
  deviceId: string,
  plantId: string,
  params: Record<string, unknown> = {},
) =>
  useQuery({
    queryKey: [
      ...deviceKeys.information(deviceId),
      plantId,
      params,
    ],
    queryFn: () =>
      devicesApi.information(
        deviceId,
        plantId,
        params,
      ),
    enabled: !!deviceId && !!plantId,
  });

export const useDeviceChart = (
  deviceId: string,
  plantId: string,
  range: "day" | "month" | "year",
  date: string,
  params: Record<string, unknown> = {},
) =>
  useQuery({
    queryKey: [
      ...deviceKeys.detail(deviceId),
      "chart",
      plantId,
      range,
      date,
    ],

    queryFn: () =>
      devicesApi.chart(deviceId, {
        plantId,
        range,
        date,
        ...params,
      }),

    enabled: !!deviceId && !!plantId,
  });
export const useDeviceView = (
  deviceId: string,
  plantId: string,
  params: Record<string, unknown> = {},
) =>
  useQuery({
    queryKey: [
      ...deviceKeys.detail(deviceId),
      "view",
      plantId,
      params,
    ],
    queryFn: () =>
      devicesApi.view(
        deviceId,
        plantId,
        params,
      ),
    enabled: !!deviceId && !!plantId,
  });

export const useDeviceLogs = (
  deviceId: string,
  params: Record<string, unknown>
) =>
  useQuery({
    queryKey: deviceKeys.logs(deviceId, params),
    queryFn: () => devicesApi.deviceLogs(deviceId, params as any),
    enabled: !!deviceId,
  });

export const useDeviceLogsExport = () =>
  useMutation({
    mutationFn: ({
      deviceId,
      params,
    }: {
      deviceId: string;
      params: DeviceLogsExportParams;
    }) => devicesApi.deviceLogsExport(deviceId, params),
  });

export const useDeviceChartExport = () =>
  useMutation({
    mutationFn: ({
      deviceId,
      params,
    }: {
      deviceId: string;
      params: {
        plantId: string;
        date: string;
        range: "day" | "month" | "year";
        format: "csv";
        fromService?: boolean;
        targetEndUserId?: string;
      }
    }) => devicesApi.chartExport(deviceId, params),
  });

export const useDeviceInformationExport = () =>
  useMutation({
    mutationFn: ({
      deviceId,
      params,
    }: {
      deviceId: string;
      params: {
        plantId: string;
        dateFrom: string;
        dateTo: string;
        format: "csv";
        fromService?: boolean;
        targetEndUserId?: string;
      }
    }) => devicesApi.informationExport(deviceId, params),
  });

export const useDeviceCurrentAlerts = (
  deviceId: string,
  params: Record<string, unknown>
) =>
  useQuery({
    queryKey: deviceKeys.currentAlerts(deviceId, params),
    queryFn: () =>
      devicesApi.currentAlerts(deviceId, params),
    enabled: !!deviceId,
  });


export const useRemoteSettingsTab = <K extends RemoteSettingsTabKey>(
  deviceId: string,
  tab: K,
  plantId: string,
  params: ServiceScopeParams = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: deviceKeys.remoteSettingsTab(deviceId, tab, { plantId, ...params }),
    queryFn: () => devicesApi.remoteSettingsTab(deviceId, tab, plantId, params),
    enabled: !!deviceId && !!plantId && (options.enabled ?? true),
  });

export const useSubmitRemoteSettingsTab = (plantId: string, params: ServiceScopeParams = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      deviceId: string;
      sn?: string;
      entry: RemoteSettingsTabEntry;
    }) =>
      devicesApi.submitRemoteSettingsTab(
        variables.deviceId,
        variables.sn,
        variables.entry,
        plantId,
        params,
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: deviceKeys.remoteSettingsTab(
          variables.deviceId,
          variables.entry.tab,
          { plantId, ...params },
        ),
      });
      queryClient.invalidateQueries({
        queryKey: [...serviceKeys.all, "settingTasks"],
      });
    },
  });
};

export const useSubmitRemoteCommand = (plantId: string, params: ServiceScopeParams = {}) =>
  useMutation({
    mutationFn: ({
      deviceId,
      sn,
      command,
    }: {
      deviceId: string;
      sn?: string;
      command: RemoteSettingsCommand;
    }) => devicesApi.submitRemoteCommand(deviceId, { sn, command }, plantId, params),
  });