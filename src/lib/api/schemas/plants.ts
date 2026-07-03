import { z } from "zod";
import { metricSchema, paginationSchema } from "./common";

const plantCurrentStatusSchema = z.object({
  status: z.enum(["Offline", "Normal", "Abnormal", "Standby"]),
  totalDevices: z.number(),
  normalCount: z.number(),
  abnormalCount: z.number(),
  standbyCount: z.number(),
  offlineCount: z.number(),
  updatedAt: z.string(),
});

export const plantSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  price: z.number(),
  priceUnit: z.string(),
  kwp: z.number(),
  address: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  eToday: metricSchema,
  eTotal: metricSchema,
  power: metricSchema,
  effect: z.string(),
  installed: z.string(),
  updated: z.string(),

  plantStatus: plantCurrentStatusSchema,
});

export const plantListResponseSchema = z.object({
  items: z.array(plantSchema),
  statusCounts: z.object({
    All: z.number(),
    Online: z.number(),
    Offline: z.number(),
    Abnormal: z.number(),
    Standby: z.number(),
  }),
  pagination: paginationSchema,
});

export const plantSummarySchema = z.object({
  currentPower: metricSchema,
  eToday: metricSchema,
  eTotal: metricSchema,
  hTotal: metricSchema,
  capacity: metricSchema,
  statusCounts: z.object({
    All: z.number(),
    Normal: z.number(),
    Abnormal: z.number(),
    Standby: z.number(),
    Offline: z.number(),
  }),
});

export const createPlantRequestSchema = z.object({
  plantName: z.string().min(1),
  installedDate: z.string().min(1),
  kwp: z.number(),
  price: z.number(),
  priceUnit: z.string(),
  plantType: z.string(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  address: z.string().optional(),
  pictureFileId: z.string().optional(),
});

export type PlantListExportResponse = {
  fileName: string;
  downloadUrl: string;
  expiresAt: string;
};

export type PlantLogsExportParams = {
  search?: string;
  event?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: "csv";
};

export type PlantLog = {
  id: string;
  name: string;
  type: string;
  sn: string;
  time: string;
};

export type PlantLogsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  event?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type PlantLogsResponse = {
  items: PlantLog[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type UserLogsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  event?: string;
  dateFrom?: string;
  dateTo?: string;

  fromService?: boolean;
  targetEndUserId?: string;
};

export type UserLogsResponse = {
  items: {
    id: string;
    name: string;
    account: string;
    type: string;
    sn: string;
    time: string;
    status: string;
    event: string;
  }[];

  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type Plant = z.infer<typeof plantSchema>;
export type PlantSummary = z.infer<typeof plantSummarySchema>;
export type CreatePlantRequest = z.infer<typeof createPlantRequestSchema>;
