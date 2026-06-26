import { z } from "zod";
import { metricSchema, paginationSchema } from "./common";

export const monitorUserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  account: z.string(),
  affiliation: z.string(),
  power: metricSchema,
  today: metricSchema,
  total: metricSchema,
  status: z.object({
    normal: z.number(),
    fault: z.number(),
    standby: z.number(),
    offline: z.number(),
  }),
});

export type MonitorUsersExportResponse = string;
// export type MonitorUsersExportResponse = {
//   fileName: string;
//   downloadUrl: string;
//   expiresAt: string;
// };
export const monitorFiltersSchema = z.object({
  status: z.string(),
  sortBy: z.string(),
  sortOrder: z.string(),
  searchUser: z.string(),
  searchSN: z.string(),
  searchInstallationDate: z.string(),
  searchAffiliation: z.string(),
});

export const monitorUsersResponseSchema = z.object({
  items: z.array(monitorUserSchema),
  statusCounts: z.object({
    normal: z.number(),
    fault: z.number(),
    standby: z.number(),
    offline: z.number(),
  }),
  pagination: paginationSchema,
  filters: monitorFiltersSchema,
});

export const profileSchema = z.object({
  userName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string(),
});

export const firmwareSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  createdTime: z.string(),
  remark: z.string(),
});

export const taskSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  status: z.string(),
  created: z.string(),
  begin: z.string(),
});

export const createMonitorUserPayloadSchema = z.object({
  account: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  email: z.string(),
  phone: z.string(),
  timezone: z.string(),
});

export const createdMonitorUserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  account: z.string(),
  email: z.string(),
  phone: z.string(),
  timezone: z.string(),
  role: z.string(),
  portal: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

export const assignMonitorUsersPayloadSchema = z.object({
  monitorUserIds: z.array(z.string()),
  assignedToUserId: z.string(),
});

export const assignMonitorUsersResponseSchema = z.object({
  assignedToUserId: z.string(),
  monitorUserIds: z.array(z.string()),
  assignedCount: z.number(),
  updatedAt: z.string(),
});

export type AssignMonitorUsersPayload = z.infer<
  typeof assignMonitorUsersPayloadSchema
>;
export type AssignMonitorUsersResponse = z.infer<
  typeof assignMonitorUsersResponseSchema
>;

export type CreateMonitorUserPayload = z.infer<
  typeof createMonitorUserPayloadSchema
>;
export type CreatedMonitorUser = z.infer<typeof createdMonitorUserSchema>;
export type MonitorUser = z.infer<typeof monitorUserSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Firmware = z.infer<typeof firmwareSchema>;
export type ServiceTask = z.infer<typeof taskSchema>;
export type MonitorFilters = z.infer<typeof monitorFiltersSchema>;
