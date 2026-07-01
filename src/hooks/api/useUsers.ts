"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import type {
  CreateSubAccountRequest,
  SearchDeviceRequest,
} from "@/lib/api/schemas/users";

export const useCreateSubAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSubAccountRequest) =>
      usersApi.createSubAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subaccounts"],
      });
    },
  });
};

export const useGetSubAccounts = () => {
  return useQuery({
    queryKey: ["subaccounts"],
    queryFn: () => usersApi.getViewUsers(),
  });
};

export const useEditSubAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: import("../../lib/api/schemas/users").EditSubAccountRequest;
    }) => usersApi.editSubAccount(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subaccounts"],
      });
    },
  });
};

export const useDeleteSubAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteSubAccount(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subaccounts"],
      });
    },
  });
};

export const useSearchUser = () => {
  return useMutation({
    mutationFn: usersApi.searchUser,
  });
};
export const useSearchDevice = () => {
  return useMutation({
    mutationFn: (payload: SearchDeviceRequest) =>
      usersApi.searchDevice(payload),
  });
};