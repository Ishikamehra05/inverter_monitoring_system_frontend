"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isBackendUnavailable } from "@/lib/api/errors";
import { mockPlants, mockPlantSummary } from "@/lib/api/mockData";
import { plantsApi, type PlantListParams, } from "@/lib/api/plants";
import type { CreatePlantRequest, PlantLogsParams, PlantLogsExportParams, UserLogsParams } from "@/lib/api/schemas/plants";

export const plantKeys = {
  all: ["plants"] as const,
  list: (params: PlantListParams) => [...plantKeys.all, "list", params] as const,
  summary: (params: Record<string, unknown>) =>
    [...plantKeys.all, "summary", params] as const,
};

export const userLogKeys = {
  all: ["user-logs"] as const,

  list: (params: UserLogsParams) =>
    [...userLogKeys.all, params] as const,
};

export const usePlants = (params: PlantListParams = {}) =>
  useQuery({
    queryKey: plantKeys.list(params),
    queryFn: async () => {
      try {
        return await plantsApi.list(params);
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;
        return {
          items: mockPlants,
          pagination: {
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 10,
            totalItems: mockPlants.length,
            totalPages: Math.ceil(mockPlants.length / (params.pageSize ?? 10)),
          },
        };
      }
    },
  });

export const usePlantSummary = (
  params: {
    ownerUserId?: string;
    fromService?: boolean;
    selectedEndUserId?: string;
  } = {}
) =>
  useQuery({
    queryKey: plantKeys.summary(params),
    queryFn: async () => {
      try {
        return await plantsApi.summary(params);
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;
        return mockPlantSummary;
      }
    },
  });

// export const useCreatePlant = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (payload: CreatePlantRequest) => {
//       try {
//         return await plantsApi.create(payload);
//       } catch (error) {
//         if (!isBackendUnavailable(error)) throw error;
//         return { id: `dev_${Date.now()}` };
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: plantKeys.all });
//     },
//   });
// };

export const useCreatePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePlantRequest) => {
      try {
        return await plantsApi.create(payload);
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;

        return { id: `dev_${Date.now()}` };
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: plantKeys.all,
      });

      await queryClient.refetchQueries({
        queryKey: plantKeys.all,
      });
    },
  });
};

// export const useDeletePlant = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (plantId: string) => {
//       try {
//         return await plantsApi.remove(plantId);
//       } catch (error) {
//         if (!isBackendUnavailable(error)) throw error;

//         return null;
//       }
//     },

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: plantKeys.all,
//       });
//     },
//   });
// };

export const useDeletePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      plantId,
      serviceParams,
    }: {
      plantId: string;
      serviceParams?: {
        fromService?: boolean;
        targetEndUserId?: string;
      };
    }) => {
      try {
        return await plantsApi.remove(
          plantId,
          serviceParams
        );
      } catch (error) {
        if (!isBackendUnavailable(error)) throw error;

        return null;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: plantKeys.all,
      });
    },
  });
};
// export const useUpdatePlant = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       plantId,
//       payload,
//     }: {
//       plantId: string;
//       payload: Partial<CreatePlantRequest>;
//     }) => {
//       return plantsApi.update(
//         plantId,
//         payload
//       );
//     },

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: plantKeys.all,
//       });
//     },
//   });
// };

export const useUpdatePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      plantId,
      payload,
      serviceParams,
    }: {
      plantId: string;
      payload: Partial<CreatePlantRequest>;
      serviceParams?: {
        fromService?: boolean;
        targetEndUserId?: string;
      };
    }) => {
      return plantsApi.update(
        plantId,
        payload,
        serviceParams
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: plantKeys.all,
      });
    },
  });
};
export const usePlantListExport = () =>
  useMutation({
    mutationFn: async (
      serviceParams?: {
        fromService?: boolean;
        targetEndUserId?: string;
      }
    ) => {
      return plantsApi.plantListExport(
        serviceParams
      );
    },
  });

export const usePlantLogsExport = () =>
  useMutation({
    mutationFn: ({
      plantId,
      params,
    }: {
      plantId: string;
      params: PlantLogsExportParams;
    }) => plantsApi.plantLogsExport(plantId, params),
  });

export const plantLogKeys = {
  all: ["plant-logs"] as const,
  list: (plantId: string, params: PlantLogsParams) =>
    [...plantLogKeys.all, plantId, params] as const,
};

export const usePlantLogs = (
  plantId: string,
  params: PlantLogsParams
) =>
  useQuery({
    queryKey: plantLogKeys.list(plantId, params),
    queryFn: () => plantsApi.plantLogs(plantId, params),
    enabled: !!plantId,
  });

export const useUserLogs = (
  params: UserLogsParams
) =>
  useQuery({
    queryKey: userLogKeys.list(params),

    queryFn: () =>
      plantsApi.userLogs(params),
  });