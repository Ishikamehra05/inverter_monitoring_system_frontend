import { apiClient, withQuery } from "./apiClient";
import type {
  Firmware,
  MonitorUser,
  Profile,
  ServiceTask,
  CreateMonitorUserPayload,
  CreatedMonitorUser,
  AssignMonitorUsersResponse,
  AssignMonitorUsersPayload,
  MonitorFilters,
  MonitorUsersExportResponse,
  RelateUserResponse,
  RelateUserRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  MonitorUserStatusCountsResponse,
} from "./schemas/service";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type ServiceScopeParams = {
  fromService?: boolean;
  targetEndUserId?: string;
};

export const serviceApi = {
  monitorUsers: (params: Record<string, unknown> = {}) =>
    apiClient<
      ApiEnvelope<{
        items: MonitorUser[];
        statusCounts: {
          online: number;
          abnormal: number;
          standby: number;
          offline: number;
        };
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        };
        filters: MonitorFilters;
      }>
    >(`/service/monitor-users${withQuery(params)}`).then((res) => res.data),

  monitorUsersExport: (params: ServiceScopeParams = {}) =>
    apiClient<string>(`/service/monitor-users/export${withQuery(params)}`),

  relateMonitorUser: (body: RelateUserRequest, params?: ServiceScopeParams) =>
    apiClient<RelateUserResponse>("/service/monitor-users/relate", {
      method: "POST",
      body,
    }),
  profile: () =>
    apiClient<ApiEnvelope<Profile>>("/service/profile").then((res) => res.data),

  changePassword: (payload: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    apiClient<ApiEnvelope<null>>("/auth/changePassword", {
      method: "POST",
      body: payload,
    }),

  getMonitorUserStatusCounts: (params: ServiceScopeParams = {}) =>
    apiClient<MonitorUserStatusCountsResponse>(
      `/service/monitor-users/status-counts${withQuery(params)}`,
      {
        method: "GET",
      },
    ),
  updateUserProfile: (
    body: UpdateProfileRequest,
    params: ServiceScopeParams = {},
  ) =>
    apiClient<UpdateProfileResponse>(`/service/profile${withQuery(params)}`, {
      method: "PUT",
      body,
    }),

  firmware: (params: Record<string, unknown> = {}) =>
    apiClient<
      ApiEnvelope<{
        items: Firmware[];
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        };
      }>
    >(`/service/firmware${withQuery(params)}`).then((res) => res.data),

  uploadFirmware: (formData: FormData) =>
    apiClient<ApiEnvelope<{ firmwareId: string }>>("/service/firmware", {
      method: "POST",
      formData,
    }).then((res) => res.data),

  deleteFirmware: (firmwareId: string) =>
    apiClient<ApiEnvelope<null>>(`/service/firmware/${firmwareId}`, {
      method: "DELETE",
    }),

  upgradeTasks: (params: Record<string, unknown> = {}) =>
    apiClient<
      ApiEnvelope<{
        items: ServiceTask[];
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        };
      }>
    >(`/service/upgrade-tasks${withQuery(params)}`).then((res) => res.data),

  createUpgradeTask: (payload: Record<string, unknown>) =>
    apiClient<ApiEnvelope<{ taskId: string }>>("/service/upgrade-tasks", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  settingTasks: (params: Record<string, unknown> = {}) =>
    apiClient<ApiEnvelope<{ items: ServiceTask[] }>>(
      `/service/setting-tasks${withQuery(params)}`,
    ).then((res) => res.data),

  createSettingTask: (payload: Record<string, unknown>) =>
    apiClient<ApiEnvelope<{ taskId: string }>>("/service/setting-tasks", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  createMonitorUser: (payload: CreateMonitorUserPayload) =>
    apiClient<ApiEnvelope<CreatedMonitorUser>>(
      "/service/monitor-users/create",
      {
        method: "POST",
        body: payload,
      },
    ).then((res) => res),

  assignMonitorUsers: (payload: AssignMonitorUsersPayload) =>
    apiClient<ApiEnvelope<AssignMonitorUsersResponse>>(
      "/service/monitor-users/assign",
      {
        method: "POST",
        body: payload,
      },
    ).then((res) => res.data),
};
