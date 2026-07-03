// import { apiClient, withQuery } from "./apiClient";
// import type {
//   CreatePlantRequest, Plant, PlantSummary, PlantListExportResponse, PlantLogsExportParams,
//   PlantLogsParams, PlantLogsResponse, UserLogsParams, UserLogsResponse
// } from "./schemas/plants";

// type ApiEnvelope<T> = {
//   success: boolean;
//   message?: string;
//   data: T;
// };

// export type PlantListParams = {
//   page?: number;
//   pageSize?: number;
//   status?: string;
//   plantTypes?: string[];
//   search?: string;
//   sortBy?: string;
//   sortOrder?: "asc" | "desc";
//   ownerUserId?: string;
//   selectedEndUserId?: string;
// };

// export const plantsApi = {
//   list: (params: PlantListParams = {}) =>
//     apiClient<
//       ApiEnvelope<{
//         items: Plant[];
//         pagination: {
//           page: number;
//           pageSize: number;
//           totalItems: number;
//           totalPages: number;
//         };
//       }>
//     >(`/monitor/plants/list${withQuery(params)}`)
//       .then((res) => res.data),

//   summary: (params: { ownerUserId?: string } = {}) =>
//     apiClient<ApiEnvelope<PlantSummary>>(
//       `/monitor/plants/summary${withQuery(params)}`
//     ).then((res) => res.data),

//   create: (payload: CreatePlantRequest) =>
//     apiClient<ApiEnvelope<{ id: string }>>("/monitor/plants/create", {
//       method: "POST",
//       body: payload,
//     }).then((res) => res.data),

//   update: (plantId: string, payload: Partial<CreatePlantRequest>) =>
//     apiClient<ApiEnvelope<null>>(`/monitor/plants/${plantId}/edit`, {
//       method: "POST",
//       body: payload,
//     }),

//   remove: (plantId: string) =>
//     apiClient<ApiEnvelope<null>>(`/monitor/plants/${plantId}/delete`, {
//       method: "POST",
//       body: {}
//     }),

//   serviceUserPlants: (monitorUserId: string) =>
//     apiClient<ApiEnvelope<{ items: Plant[] }>>(
//       `/service/monitor-users/${monitorUserId}/plants`,
//     ).then((res) => res.data),

//   plantListExport: () =>
//     apiClient<ApiEnvelope<PlantListExportResponse>>(
//       "/monitor/plants/list/export"
//     ).then((res) => res.data),

//   plantLogsExport: (
//     plantId: string,
//     params: PlantLogsExportParams
//   ) =>
//     apiClient<string>(
//       `/monitor/plants/${plantId}/logs/export${withQuery(params)}`
//     ),

//   plantLogs: (
//     plantId: string,
//     params: PlantLogsParams = {}
//   ) =>
//     apiClient<ApiEnvelope<PlantLogsResponse>>(
//       `/monitor/plants/${plantId}/logs${withQuery(params)}`
//     ).then((res) => res.data),

//   userLogs: (
//     params: UserLogsParams = {}
//   ) =>
//     apiClient<ApiEnvelope<UserLogsResponse>>(
//       `/monitor/logs${withQuery(params)}`
//     ).then((res) => res.data),
// };

import { apiClient, withQuery } from "./apiClient";
import type {
  CreatePlantRequest,
  Plant,
  PlantSummary,
  PlantListExportResponse,
  PlantLogsExportParams,
  PlantLogsParams,
  PlantLogsResponse,
  UserLogsParams,
  UserLogsResponse,
} from "./schemas/plants";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type PlantListParams = {
  page?: number;
  pageSize?: number;
  status?: string;
  plantTypes?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  ownerUserId?: string;
  selectedEndUserId?: string;
};

export type ServiceScopeParams = {
  fromService?: boolean;
  targetEndUserId?: string;
};

export const plantsApi = {
  list: (params: PlantListParams = {}) =>
    apiClient<
      ApiEnvelope<{
        items: Plant[];
        statusCounts: {
          All: number;
          Online: number;
          Offline: number;
          Abnormal: number;
          Standby: number;
        };
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        };
      }>
    >(`/monitor/plants/list${withQuery(params)}`).then((res) => res.data),

  summary: (
    params: {
      ownerUserId?: string;
      fromService?: boolean;
      targetEndUserId?: string;
    } = {},
  ) =>
    apiClient<ApiEnvelope<PlantSummary>>(
      `/monitor/plants/summary${withQuery(params)}`,
    ).then((res) => res.data),

  create: (payload: CreatePlantRequest) =>
    apiClient<ApiEnvelope<{ id: string }>>("/monitor/plants/create", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  update: (
    plantId: string,
    payload: Partial<CreatePlantRequest>,
    params: ServiceScopeParams = {},
  ) =>
    apiClient<ApiEnvelope<null>>(
      `/monitor/plants/${plantId}/edit${withQuery(params)}`,
      {
        method: "POST",
        body: payload,
      },
    ),

  remove: (plantId: string, params: ServiceScopeParams = {}) =>
    apiClient<ApiEnvelope<null>>(
      `/monitor/plants/${plantId}/delete${withQuery(params)}`,
      {
        method: "POST",
        body: {},
      },
    ),

  serviceUserPlants: (monitorUserId: string) =>
    apiClient<ApiEnvelope<{ items: Plant[] }>>(
      `/service/monitor-users/${monitorUserId}/plants`,
    ).then((res) => res.data),

  plantListExport: (params: ServiceScopeParams = {}) =>
    apiClient<ApiEnvelope<PlantListExportResponse>>(
      `/monitor/plants/list/export${withQuery(params)}`,
    ).then((res) => res.data),

  plantLogsExport: (plantId: string, params: PlantLogsExportParams) =>
    apiClient<string>(
      `/monitor/plants/${plantId}/logs/export${withQuery(params)}`,
    ),

  plantLogs: (plantId: string, params: PlantLogsParams = {}) =>
    apiClient<ApiEnvelope<PlantLogsResponse>>(
      `/monitor/plants/${plantId}/logs${withQuery(params)}`,
    ).then((res) => res.data),

  userLogs: (params: UserLogsParams = {}) =>
    apiClient<ApiEnvelope<UserLogsResponse>>(
      `/monitor/logs${withQuery(params)}`,
    ).then((res) => res.data),
};
