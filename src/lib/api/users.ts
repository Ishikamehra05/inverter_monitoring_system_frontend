import { apiClient } from "./apiClient";
import type {
  CreateSubAccountRequest,
  SearchDeviceRequest,
  SearchDeviceResponse,
  SearchUserRequest,
  SearchUserResponse,
  SubAccountResponse,
} from "./schemas/users";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const usersApi = {
  createSubAccount: (payload: CreateSubAccountRequest) =>
    apiClient<ApiEnvelope<{ user: SubAccountResponse }>>("/users/register", {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  searchUser: (payload: SearchUserRequest) =>
    apiClient<ApiEnvelope<{ user: SearchUserResponse }>>(
      "/service/search-user",
      {
        method: "POST",
        body: payload,
      },
    ).then((res) => res.data),

  searchDevice: (payload: SearchDeviceRequest) =>
    apiClient<ApiEnvelope<{ device: SearchDeviceResponse }>>(
      "/service/search-device",
      {
        method: "POST",
        body: payload,
      },
    ).then((res) => res.data),
  getViewUsers: () =>
    apiClient<ApiEnvelope<any>>(`/service/admin`, {
      method: "GET",
    }).then((res) => {
      if (Array.isArray(res.data)) return res.data as SubAccountResponse[];
      if (res.data?.items && Array.isArray(res.data.items))
        return res.data.items as SubAccountResponse[];
      if (res.data?.data && Array.isArray(res.data.data))
        return res.data.data as SubAccountResponse[];
      if (res.data?.users && Array.isArray(res.data.users))
        return res.data.users as SubAccountResponse[];
      if (res.data?.user)
        return (
          Array.isArray(res.data.user) ? res.data.user : [res.data.user]
        ) as SubAccountResponse[];
      return [] as SubAccountResponse[];
    }),

  editSubAccount: (
    userId: string,
    payload: import("./schemas/users").EditSubAccountRequest,
  ) =>
    apiClient<ApiEnvelope<any>>(`/users/${userId}/edit`, {
      method: "POST",
      body: payload,
    }).then((res) => res.data),

  deleteSubAccount: (userId: string) =>
    apiClient<ApiEnvelope<any>>(`/users/${userId}/delete`, {
      method: "DELETE",
    }).then((res) => res.data),
};
