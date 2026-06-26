import { z } from "zod";
import { metricSchema, paginationSchema } from "./common";

export const deviceSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  type: z.string(),
  sn: z.string(),
  power: metricSchema,
  today: metricSchema.optional(),
  eToday: metricSchema.optional(),
  total: metricSchema.optional(),
  eTotal: metricSchema.optional(),
  hours: metricSchema.optional(),
  hTotal: metricSchema.optional(),
  online: z.boolean().optional(),
  status: z.string().optional(),
  updateTime: z.string().optional(),
});

export const deviceListResponseSchema = z.object({
  items: z.array(deviceSchema),
  pagination: paginationSchema,
});

export const deviceInformationSchema = z.object({
  basicStats: z.array(z.object({ label: z.string(), value: z.string() })),
  stringStats: z.array(z.object({ label: z.string(), value: z.string() })),
});

export const addDeviceRequestSchema = z.object({
  type: z.enum(["inverter", "logger"]),
  serialNumber: z.string().min(1),
});

export interface DeviceChart {
  range: "day" | "month" | "year";
  chartType: "area" | "bar";
  unit: string;

  period: {
    date?: string;
    month?: number;
    year?: number;
  };

  device: {
    id: string;
    name: string;
    sn: string;
    type: string;
  };

  series: {
    key: string;
    label: string;
    unit: string;
    color: string;
  }[];

  points: Record<string, any>[];
}

export interface DeviceView {
  id: string;
  name: string;
  type: string;
  sn: string;
  currentPower: number | null;
  eToday: number | null;
  eTotal: number | null;
  hTotal: number | null;
  latestUpdate: string | null;
  status: string;
}

export type DeviceLogsParams = {
  plantId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  event?: string;
  dateFrom?: string;
  dateTo?: string;
  fromService?: boolean;
  targetEndUserId?: string;
};

export type DeviceLogsResponse = {
  items: {
    id: string;
    name: string;
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
  filters: {
    search: string;
    event: string;
    dateFrom: string;
    dateTo: string;
  };
};

export type DeviceLogsExportParams = {
  plantId: string;
  search?: string;
  event?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  format?: "csv";
  fromService?: boolean;
  targetEndUserId?: string;
};

export type ApiDevice = z.infer<typeof deviceSchema>;
export type DeviceInformation = z.infer<typeof deviceInformationSchema>;
export type AddDeviceRequest = z.infer<typeof addDeviceRequestSchema>;
