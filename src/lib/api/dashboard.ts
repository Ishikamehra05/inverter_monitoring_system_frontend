import { apiClient, withQuery } from "./apiClient";
import type {
  ApiAlert,
  ApiLog,
  ChartResponse,
  PlantInformation,
  PlantOverviewResponse,
  PlantChartExportResponse
} from "./schemas/dashboard";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const dashboardApi = {

  plantOverview: (plantId: string, params: Record<string, unknown>) =>
    apiClient<ApiEnvelope<PlantOverviewResponse>>(
      `/monitor/plants/${plantId}/overview${withQuery(params)}`,
    ).then((res) => res.data),

  plantInformation: (
    plantId: string,
    params: Record<string, unknown> = {}
  ) =>
    apiClient<ApiEnvelope<PlantInformation>>(
      `/monitor/plants/${plantId}/information${withQuery(params)}`,
    ).then((res) => res.data),

  plantChart: (plantId: string, params: Record<string, unknown>) =>
    apiClient<ApiEnvelope<ChartResponse>>(
      `/monitor/plants/${plantId}/chart${withQuery(params)}`,
    ).then((res) => res.data),

  deviceChart: (deviceId: string, params: Record<string, unknown>) =>
    apiClient<ApiEnvelope<ChartResponse>>(
      `/monitor/devices/${deviceId}/chart${withQuery(params)}`,
    ).then((res) => res.data),

  analysisDevices: (
    plantId: string,
    params: Record<string, unknown> = {}
  ) =>
    apiClient<
      ApiEnvelope<{
        totalDevices: number;
        items: {
          id: string;
          name: string;
          sn: string;
          type: string;
        }[];
      }>
    >(
      `/monitor/plants/${plantId}/analysis/devices${withQuery(params)}`
    ).then(
      (res) => res.data
    ),

  analysisParameters: (
    plantId: string,
    deviceId: string,
    date: string,
    params: Record<string, unknown> = {},
  ) =>
    apiClient<
      ApiEnvelope<{
        device: {
          id: string;
          sn: string;
          type: string;
        };

        groups: {
          label: string;

          parameters: {
            key: string;
            label: string;
            unit: string;
            axis: string;
          }[];
        }[];
      }>
    >(
      `/monitor/plants/${plantId}/analysis/parameters${withQuery({
        deviceId,
        date,
        ...params,
      })}`
    ).then(
      (res) => res.data
    ),

  analysisChart: (
    plantId: string,
    params: {
      deviceId: string;
      date: string;
      parameters: string;
      interval?: string;
      fromService?: boolean;
      targetEndUserId?: string;
    }
  ) =>
    apiClient<
      ApiEnvelope<{
        date: string;
        interval: string;
        device: {
          id: string;
          name: string;
          sn: string;
          type: string;
        };
        selectedParameters: {
          key: string;
          label: string;
          group: string;
          unit: string;
          axis: string;
        }[];
        points: Record<string, string | number | null>[];
      }>
    >(
      `/monitor/plants/${plantId}/analysis${withQuery({
        deviceId: params.deviceId,
        date: params.date,
        parameters: params.parameters,
        interval: params.interval ?? "15m",
        fromService: params.fromService,
        targetEndUserId: params.targetEndUserId,
      })}`
    ).then((res) => res.data),


  plantLogs: (plantId: string, params: Record<string, unknown>) =>
    apiClient<
      ApiEnvelope<{
        items: ApiLog[];
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        };
      }>
    >(`/monitor/plants/${plantId}/logs${withQuery(params)}`).then(
      (res) => res.data,
    ),

  deviceLogs: (deviceId: string, params: Record<string, unknown>) =>
    apiClient<ApiEnvelope<{ items: ApiLog[] }>>(
      `/monitor/devices/${deviceId}/logs${withQuery(params)}`,
    ).then((res) => res.data),

  plantAlerts: (plantId: string) =>
    apiClient<ApiEnvelope<{ items: ApiAlert[] }>>(
      `/monitor/plants/${plantId}/alerts`,
    ).then((res) => res.data),

  deviceAlerts: (deviceId: string) =>
    apiClient<ApiEnvelope<{ items: ApiAlert[] }>>(
      `/monitor/devices/${deviceId}/alerts`,
    ).then((res) => res.data),

  plantChartExport: (
    plantId: string,
    params: Record<string, unknown>
  ) =>
    apiClient<ApiEnvelope<PlantChartExportResponse>>(
      `/monitor/plants/${plantId}/chart/export${withQuery(params)}`
    ).then((res) => res.data),
};
