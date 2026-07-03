import { z } from "zod";

export const createSubAccountRequestSchema = z.object({
  account: z.string().min(1, "Account name is required"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string().min(1, "Confirm Password is required"),
  email: z.string().email("Invalid email"),
  timezone: z.string().min(1, "Timezone is required"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  role: z.string(),
  portal: z.string(),
});

export const subAccountResponseSchema = z.object({
  id: z.string(),
  account: z.string(),
  email: z.string().optional(),
  portal: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  timezone: z.string().optional(),
  phone: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const editSubAccountRequestSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  timezone: z.string().optional(),
  password: z.string().optional(),
});

export const searchUserRequestSchema = z.object({
  account: z.string().trim().min(1, "Account is required"),
});

export interface SearchUserResponse {
  id: string;
  account: string;
  email: string | null;
  portal: string;
  role: string;
  status: string;
  timezone: string | null;
  phone: string | null;
  address: string | null;
  assignedById: string | null;
  isDeleted: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SearchDeviceRequest {
  sno: string;
}

export interface SearchDeviceResponse {
  id: string;
  sno: string;
  inverterName: string | null;
  dayDate: string;
  latestTimestamp: string;
  dailyProduction: number | null;
  totalEnergy: number | null;
  totalHours: number | null;
  currentPower: number | null;

  status: string;
  userId: string | null;
  account: string | null;

  createdAt: string;
  updatedAt: string;
}

export type CreateSubAccountRequest = z.infer<typeof createSubAccountRequestSchema>;
export type SubAccountResponse = z.infer<typeof subAccountResponseSchema>;
export type EditSubAccountRequest = z.infer<typeof editSubAccountRequestSchema>;
export type SearchUserRequest = z.infer<typeof searchUserRequestSchema>;
