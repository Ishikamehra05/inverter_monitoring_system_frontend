import { ApiError, BackendUnavailableError } from "./errors";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  formData?: FormData;
  headers?: Record<string, string>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const buildUrl = (endpoint: string) => {
  if (!API_BASE_URL) throw new BackendUnavailableError();
  return `${API_BASE_URL.replace(/\/$/, "")}${endpoint}`;
};

const getRefreshToken = () => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("refreshToken");
};

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) throw new Error("No refresh token");

  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });

  if (!response.ok) {
    localStorage.removeItem("token");

    localStorage.removeItem("refreshToken");

    window.location.href = "/login";

    throw new Error("Refresh failed");
  }

  const payload = await response.json();

  const { accessToken, refreshToken: newRefreshToken } = payload.data;

  localStorage.setItem("token", accessToken);

  localStorage.setItem("refreshToken", newRefreshToken);

  console.log(refreshAccessToken);

  return accessToken;
}
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getToken();
  const isForm = Boolean(options.formData);

  let response = await fetch(buildUrl(endpoint), {
    method: options.method ?? "GET",
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: isForm
      ? options.formData
      : options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  if (response.status === 401 && getRefreshToken()) {
    try {
      const newToken = await refreshAccessToken();

      response = await fetch(buildUrl(endpoint), {
        method: options.method ?? "GET",

        headers: {
          ...(isForm
            ? {}
            : {
                "Content-Type": "application/json",
              }),

          Authorization: `Bearer ${newToken}`,

          ...options.headers,
        },

        body: isForm
          ? options.formData
          : options.body === undefined
            ? undefined
            : JSON.stringify(options.body),
      });
    } catch (error) {
      console.error("Token refresh failed", error);

      throw new ApiError({
        status: 401,
        message: "Session expired",
      });
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : "Request failed.";

    throw new ApiError({
      status: response.status,
      message,
      errors:
        typeof payload === "object" && payload && "errors" in payload
          ? (payload.errors as Record<string, string>)
          : undefined,
    });
  }

  return payload as T;
}

export const withQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
      return;
    }
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};
