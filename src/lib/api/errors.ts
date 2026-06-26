export type ApiErrorPayload = {
  status: number;
  message: string;
  errors?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.errors = payload.errors;
  }
}

export class BackendUnavailableError extends Error {
  constructor() {
    super("Backend API base URL is not configured.");
    this.name = "BackendUnavailableError";
  }
}

export const isBackendUnavailable = (error: unknown) =>
  error instanceof BackendUnavailableError ||
  (error instanceof TypeError && error.message.includes("fetch"));
