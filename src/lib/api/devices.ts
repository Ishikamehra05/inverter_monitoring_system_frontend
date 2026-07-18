import { apiClient, withQuery } from "./apiClient";
import type {
  AddDeviceRequest, ApiDevice, DeviceInformation, DeviceChart, DeviceView,
  DeviceLogsExportParams, DeviceLogsResponse, DeviceLogsParams, DeviceCurrentAlertsResponse,
  RemoteSettingsCommand, RemoteSettingsTabEntry, RemoteSettingsTabKey
} from "./schemas/devices";
import { REMOTE_SETTINGS_TAB_SLUGS } from "./schemas/devices";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};
export type ServiceScopeParams = {
  fromService?: boolean;
  targetEndUserId?: string;
};

export const devicesApi = {
  plantDevices: (
    plantId: string,
    params: Record<string, unknown> = {}
  ) =>
    apiClient<
      ApiEnvelope<{
        items: ApiDevice[];
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        };
      }>
    >(`/monitor/plants/${plantId}/devices${withQuery(params)}`)
      .then((res) => res.data),

  addInverter: (
    plantId: string,
    payload: { serialNumber: string },
    params: Record<string, unknown> = {}
  ) =>
    apiClient<ApiEnvelope<{ deviceId: string }>>(
      `/monitor/plants/${plantId}/devices${withQuery(params)}`,
      {
        method: "POST",
        body: payload,
      },
    ).then((res) => res.data),

  addLogger: (plantId: string, payload: Omit<AddDeviceRequest, "type">) =>
    apiClient<ApiEnvelope<{ deviceId: string }>>(
      `/monitor/plants/${plantId}/loggers`,
      {
        method: "POST",
        body: payload,
      },
    ).then((res) => res.data),

  detail: (deviceId: string) =>
    apiClient<ApiEnvelope<ApiDevice>>(`/monitor/devices/${deviceId}`).then(
      (res) => res.data,
    ),

  information: (
    deviceId: string,
    plantId: string,
    params: ServiceScopeParams = {},
  ) =>
    apiClient<ApiEnvelope<DeviceInformation>>(
      `/monitor/devices/${deviceId}/information${withQuery({
        plantId,
        ...params,
      })}`
    ).then((res) => res.data),

  serviceDevices: (
    monitorUserId: string,
    params: Record<string, unknown> = {},
  ) =>
    apiClient<ApiEnvelope<{ items: ApiDevice[] }>>(
      `/service/monitor-users/${monitorUserId}/devices${withQuery(params)}`,
    ).then((res) => res.data),

  // Each tab is its own backend entity — GET/POST a single tab's slug,
  // e.g. /monitor/devices/{id}/remote-settings/grid-parameters
  // Lives under /monitor/devices/ (not /service/devices/) and requires
  // plantId, matching every other device sub-resource in the backend.
  remoteSettingsTab: <K extends RemoteSettingsTabKey>(
    deviceId: string,
    tab: K,
    plantId: string,
    params: ServiceScopeParams = {},
  ) => {
    const url = `/monitor/devices/${deviceId}/remote-settings/${REMOTE_SETTINGS_TAB_SLUGS[tab]}${withQuery({ plantId, ...params })}`;
    console.log(`[remote-settings:${tab}] READ request →`, { method: "GET", url });
    return apiClient<ApiEnvelope<Extract<RemoteSettingsTabEntry, { tab: K }>["settings"]>>(url)
      .then((res) => {
        console.log(`[remote-settings:${tab}] READ response ←`, res);
        return res.data;
      })
      .catch((error) => {
        console.error(`[remote-settings:${tab}] READ failed ✕`, error);
        throw error;
      });
  },

  submitRemoteSettingsTab: (
    deviceId: string,
    sn: string | undefined,
    entry: RemoteSettingsTabEntry,
    plantId: string,
    params: ServiceScopeParams = {},
  ) => {
    const url = `/monitor/devices/${deviceId}/remote-settings/${REMOTE_SETTINGS_TAB_SLUGS[entry.tab]}${withQuery({ plantId, ...params })}`;
    const payload = { sn, settings: entry.settings };
    console.log(`[remote-settings:${entry.tab}] UPLOAD request →`, { method: "POST", url, payload });
    return apiClient<ApiEnvelope<{ taskId: string }>>(url, {
      method: "POST",
      body: payload,
    })
      .then((res) => {
        console.log(`[remote-settings:${entry.tab}] UPLOAD response ←`, res);
        return res.data;
      })
      .catch((error) => {
        console.error(`[remote-settings:${entry.tab}] UPLOAD failed ✕`, error);
        throw error;
      });
  },

  submitRemoteCommand: (
    deviceId: string,
    payload: { sn?: string; command: RemoteSettingsCommand },
    plantId: string,
    params: ServiceScopeParams = {},
  ) => {
    const url = `/monitor/devices/${deviceId}/remote-settings/command${withQuery({ plantId, ...params })}`;
    console.log("[remote-settings] COMMAND request →", { method: "POST", url, payload });
    return apiClient<ApiEnvelope<{ taskId: string }>>(url, {
      method: "POST",
      body: payload,
    })
      .then((res) => {
        console.log("[remote-settings] COMMAND response ←", res);
        return res.data;
      })
      .catch((error) => {
        console.error("[remote-settings] COMMAND failed ✕", error);
        throw error;
      });
  },

  submitUpgrade: (deviceId: string, payload: { sn?: string; firmwareId: string }) =>
    apiClient<ApiEnvelope<{ taskId: string }>>(
      `/service/devices/${deviceId}/upgrade`,
      { method: "POST", body: payload },
    ).then((res) => res.data),

  submitRemoteSettings: (
    deviceId: string,
    payload: { sn?: string; settings: Record<string, unknown> },
  ) =>
    apiClient<ApiEnvelope<{ taskId: string }>>(
      `/service/devices/${deviceId}/remote-settings`,
      { method: "POST", body: payload },
    ).then((res) => res.data),

  editDevice: (
    deviceId: string,
    payload: {
      plantId: string;
      name: string;
    },
    params: Record<string, unknown> = {}
  ) =>
    apiClient<
      ApiEnvelope<{
        id: string;
        updatedAt: string;
      }>
    >(`/monitor/devices/${deviceId}/edit${withQuery(params)}`, {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  deleteDevice: (
    deviceId: string,
    payload: {
      plantId: string;
      role: string;
      fromService: boolean;
    },
    params: Record<string, unknown> = {}
  ) =>
    apiClient<
      ApiEnvelope<{
        id: string;
        status: string;
        deletedAt: string;
      }>
    >(`/monitor/devices/${deviceId}/delete${withQuery(params)}`, {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  chart: (
    deviceId: string,
    params: {
      plantId: string;
      range: "day" | "month" | "year";
      date: string;
    } & ServiceScopeParams,
  ) => {
    const url =
      `/monitor/devices/${deviceId}/chart${withQuery(params)}`;

    return apiClient<ApiEnvelope<DeviceChart>>(url)
      .then((res) => res.data);
  },

  view: (
    deviceId: string,
    plantId: string,
    params: ServiceScopeParams = {},
  ) =>
    apiClient<ApiEnvelope<DeviceView>>(
      `/monitor/devices/${deviceId}/view${withQuery({
        plantId,
        ...params,
      })}`
    ).then((res) => res.data),

  deviceLogs: (
    deviceId: string,
    params: DeviceLogsParams
  ) =>
    apiClient<ApiEnvelope<DeviceLogsResponse>>(
      `/monitor/devices/${deviceId}/logs${withQuery(params)}`
    ).then((res) => res.data),

  deviceLogsExport: (
    deviceId: string,
    params: DeviceLogsExportParams
  ) =>
    apiClient<
      ApiEnvelope<{
        fileName: string;
        downloadUrl: string;
        expiresAt: string;
      }>
    >(
      `/monitor/devices/${deviceId}/logs/export${withQuery(params)}`
    ).then((res) => res.data),

  chartExport: (
    deviceId: string,
    params: {
      plantId: string;
      date: string;
      range: "day" | "month" | "year";
      format: "csv";
    } & ServiceScopeParams
  ) =>
    apiClient<string>(
      `/monitor/devices/${deviceId}/chart/export${withQuery(params)}`
    ),

  informationExport: (
    deviceId: string,
    params: {
      plantId: string;
      dateFrom: string;
      dateTo: string;
      format: "csv";
    } & ServiceScopeParams
  ) =>
    apiClient<string>(
      `/monitor/devices/${deviceId}/information/export${withQuery(params)}`
    ),

  currentAlerts: (
    deviceId: string,
    params: Record<string, unknown>
  ) =>
    apiClient<ApiEnvelope<DeviceCurrentAlertsResponse>>(
      `/monitor/devices/${deviceId}/alerts${withQuery(params)}`
    ).then((res) => res.data),
};

