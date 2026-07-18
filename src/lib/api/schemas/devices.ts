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


export const gridParametersSchema = z.object({
  standardCode: z.enum(["IN", "EU", "AU"]).optional(),
  firstConnectDelayTime: z.number().optional(),
  reconnectDelayTime: z.number().optional(),
  firstConnectPowerGradient: z.number().optional(),
  reconnectPowerGradient: z.number().optional(),
  gridFirstConnectionVoltageHighLimit: z.number().optional(),
  gridFirstConnectionVoltageLowLimit: z.number().optional(),
  gridFirstConnectionFrequencyHighLimit: z.number().optional(),
  gridFirstConnectionFrequencyLowLimit: z.number().optional(),
  gridReconnectionVoltageHighLimit: z.number().optional(),
  gridReconnectionVoltageLowLimit: z.number().optional(),
  gridReconnectionFrequencyHighLimit: z.number().optional(),
  gridReconnectionFrequencyLowLimit: z.number().optional(),
  frequencyHighLossLevel1: z.number().optional(),
  frequencyLowLossLevel1: z.number().optional(),
  voltageHighLossLevel1: z.number().optional(),
  voltageLowLossLevel1: z.number().optional(),
  frequencyHighLossTimeLevel1: z.number().optional(),
  frequencyLowLossTimeLevel1: z.number().optional(),
  voltageHighLossTimeLevel1: z.number().optional(),
  voltageLowLossTimeLevel1: z.number().optional(),
  voltageHighLossLevel2: z.number().optional(),
  voltageLowLossLevel2: z.number().optional(),
  voltageHighLossTimeLevel2: z.number().optional(),
  voltageLowLossTimeLevel2: z.number().optional(),
  overFrequencyDeratingFunction: z.boolean().optional(),
  underFrequencyFunction: z.boolean().optional(),
  overVoltageDerating: z.boolean().optional(),
});

export const featureParametersSchema = z.object({
  faultRideThroughFunction: z.boolean().optional(),
  islandDetection: z.boolean().optional(),
  terminalResistor: z.boolean().optional(),
  deratedPower: z.number().optional(),
  insulationImpedance: z.number().optional(),
  leakageCurrentPoint: z.number().optional(),
  movingAverageVoltageLimit: z.number().optional(),
});

export const reactivePowerControlSchema = z.object({
  settingTime: z.number().optional(),
  mode: z.string().optional(),
});

export const powerLimitSchema = z.object({
  powerControl: z.enum(["Disable", "Enable"]).optional(),
  meterLocation: z.enum(["Grid side", "Load side"]).optional(),
  powerFlowDirection: z.enum(["Export", "Import"]).optional(),
  maxFeedInGridPower: z.number().optional(),
  modbusAddress: z.number().optional(),
});

export const otherSettingSchema = z.object({
  afdFunction: z.boolean().optional(),
  powerOn: z.boolean().optional(),
  gridVoltageType: z.enum(["Single Phase", "Three Phase"]).optional(),
});

export const maskingFaultDetectionSchema = z.object({
  a3: z.boolean().optional(),
  a4: z.boolean().optional(),
  b1: z.boolean().optional(),
  b2: z.boolean().optional(),
  cl: z.boolean().optional(),
  b4: z.boolean().optional(),
  c2: z.boolean().optional(),
  c3: z.boolean().optional(),
  cn: z.boolean().optional(),
  ce: z.boolean().optional(),
  bb: z.boolean().optional(),
  a8: z.boolean().optional(),
});

export const remoteSettingsSchema = z.object({
  gridParameters: gridParametersSchema.optional(),
  featureParameters: featureParametersSchema.optional(),
  reactivePowerControl: reactivePowerControlSchema.optional(),
  powerLimit: powerLimitSchema.optional(),
  otherSetting: otherSettingSchema.optional(),
  maskingFaultDetection: maskingFaultDetectionSchema.optional(),
});

export const remoteSettingsCommandSchema = z.object({
  afdReset: z.boolean().optional(),
  syncDateTime: z.boolean().optional(),
  reset: z.boolean().optional(),
  clearAllData: z.boolean().optional(),
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

export interface DeviceCurrentAlert {
  id: string;
  name: string;
  sn: string;
  event: string;
  status: string;
  startedAt: string;
  lastUpdatedAt: string;
}

export interface DeviceCurrentAlertsResponse {
  items: DeviceCurrentAlert[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export type ApiDevice = z.infer<typeof deviceSchema>;
export type DeviceInformation = z.infer<typeof deviceInformationSchema>;
export type AddDeviceRequest = z.infer<typeof addDeviceRequestSchema>;
export type GridParameters = z.infer<typeof gridParametersSchema>;
export type FeatureParameters = z.infer<typeof featureParametersSchema>;
export type ReactivePowerControl = z.infer<typeof reactivePowerControlSchema>;
export type PowerLimit = z.infer<typeof powerLimitSchema>;
export type OtherSetting = z.infer<typeof otherSettingSchema>;
export type MaskingFaultDetection = z.infer<typeof maskingFaultDetectionSchema>;
export type RemoteSettings = z.infer<typeof remoteSettingsSchema>;
export type RemoteSettingsCommand = z.infer<typeof remoteSettingsCommandSchema>;

export type RemoteSettingsTabEntry =
  | { tab: "gridParameters"; settings: GridParameters }
  | { tab: "featureParameters"; settings: FeatureParameters }
  | { tab: "reactivePowerControl"; settings: ReactivePowerControl }
  | { tab: "powerLimit"; settings: PowerLimit }
  | { tab: "otherSetting"; settings: OtherSetting }
  | { tab: "maskingFaultDetection"; settings: MaskingFaultDetection };

export type RemoteSettingsTabKey = RemoteSettingsTabEntry["tab"];

export const REMOTE_SETTINGS_TAB_SLUGS: Record<RemoteSettingsTabKey, string> = {
  gridParameters: "grid-parameters",
  featureParameters: "feature-parameters",
  reactivePowerControl: "reactive-power-control",
  powerLimit: "power-limit",
  otherSetting: "other-setting",
  maskingFaultDetection: "masking-fault-detection",
};
