"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isBackendUnavailable } from "@/lib/api/errors";
import {
  mockFirmwares,
  mockMonitorUsers,
  mockProfile,
  mockTasks,
} from "@/lib/api/mockData";
import { serviceApi } from "@/lib/api/service";
import {
  RelateUserRequest,
  UpdateProfileRequest,
} from "@/lib/api/schemas/service";
import { authApi } from "@/lib/api/auth";
import { ChangePasswordRequest } from "@/lib/api/schemas/auth";

export const serviceKeys = {
  all: ["service"] as const,
  monitorUsers: (params: Record<string, unknown>) =>
    [...serviceKeys.all, "monitorUsers", params] as const,
  profile: () => [...serviceKeys.all, "profile"] as const,
  firmware: (params: Record<string, unknown>) =>
    [...serviceKeys.all, "firmware", params] as const,
  upgradeTasks: (params: Record<string, unknown>) =>
    [...serviceKeys.all, "upgradeTasks", params] as const,
};

export const useMonitorUsers = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: serviceKeys.monitorUsers(params),
    queryFn: async () => {
      try {
        return await serviceApi.monitorUsers(params);
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;
        return {
          items: mockMonitorUsers,
          statusCounts: {
            normal: 262,
            fault: 1,
            standby: 327,
            offline: 99999,
          },
          pagination: {
            page: Number(params.page ?? 1),
            pageSize: Number(params.pageSize ?? 10),
            totalItems: 8384,
            totalPages: 839,
          },
          filters: {
            status: "all",
            sortBy: "",
            sortOrder: "asc",
            searchUser: "",
            searchSN: "",
            searchInstallationDate: "",
            searchAffiliation: "",
          },
        };
      }
    },
  });

export const useMonitorUsersExport = () =>
  useMutation({
    mutationFn: async (serviceParams?: {
      fromService?: boolean;
      targetEndUserId?: string;
    }) => {
      return serviceApi.monitorUsersExport(serviceParams);
    },
  });

export const useRelateMonitorUser = () =>
  useMutation({
    mutationFn: async (body: RelateUserRequest) => {
      return serviceApi.relateMonitorUser(body);
    },
  });
export const useServiceProfile = () =>
  useQuery({
    queryKey: serviceKeys.profile(),
    queryFn: async () => {
      try {
        return await serviceApi.profile();
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;
        return mockProfile;
      }
    },
  });

export const useFirmware = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: serviceKeys.firmware(params),
    queryFn: async () => {
      try {
        return await serviceApi.firmware(params);
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;
        return {
          items: mockFirmwares,
          pagination: {
            page: Number(params.page ?? 1),
            pageSize: Number(params.pageSize ?? 5),
            totalItems: mockFirmwares.length,
            totalPages: 1,
          },
        };
      }
    },
  });

export const useUpgradeTasks = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: serviceKeys.upgradeTasks(params),
    queryFn: async () => {
      try {
        return await serviceApi.upgradeTasks(params);
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;
        return {
          items: mockTasks,
          pagination: {
            page: Number(params.page ?? 1),
            pageSize: Number(params.pageSize ?? 10),
            totalItems: mockTasks.length,
            totalPages: 1,
          },
        };
      }
    },
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<UpdateProfileRequest>) =>
      serviceApi.updateUserProfile(body),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.profile(),
      });
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      authApi.changePassword(payload),
  });
export const useUserUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      body,
    }: {
      body: UpdateProfileRequest;
      serviceParams?: {
        fromService?: boolean;
        targetEndUserId?: string;
      };
    }) => serviceApi.updateUserProfile(body),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.profile(),
      });

      queryClient.invalidateQueries({
        queryKey: ["service", "monitorUsers"],
      });
    },
  });
};
export const useCreateMonitorUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceApi.createMonitorUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service", "monitorUsers"],
      });
    },
  });
};

export const useAssignMonitorUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceApi.assignMonitorUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service", "monitorUsers"],
      });
    },
  });
};
