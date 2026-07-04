import { z } from "zod";

const valueUnitSchema = z.object({
  value: z.number(),
  unit: z.string(),
});

const metricSchema = z.object({
  value: z.number(),
  unit: z.string(),
  dataType: z.string(),
});

export const chartSeriesSchema = z.object({
  key: z.string(),
  label: z.string(),
  color: z.string(),
});

export const chartPointSchema = z
  .object({
    time: z.string(),
  })
  .catchall(z.union([z.number(), z.string()]));

export const chartResponseSchema = z.object({
  chartType: z.enum(["area", "bar"]),
  range: z.string(),
  mode: z.string(),
  unit: z.string(),

  series: z.array(chartSeriesSchema),

  points: z.array(chartPointSchema),
});


export const logSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  type: z.string(),
  sn: z.string(),
  time: z.string(),
  status: z.string(),
  event: z.string(),
});

export const alertSchema = z.object({
  name: z.string(),
  sn: z.string(),
  event: z.string(),
});

export const plantInformationSchema = z.object({
  installationDate: z.string(),
  capacity: z.string(),
  address: z.string(),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      icon: z.string().optional(),
    }),
  ),
});


export const plantOverviewSchema = z.object({
  plant: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    kwp: z.number(),

    installationDate: z.string(),
    status: z.string(),

    income: z.object({
      value: z.number(),
      unit: z.string(),
    }),
  }),

  metrics: z.object({
    currentPower: metricSchema,
    eToday: metricSchema,
    eTotal: metricSchema,
    hTotal: metricSchema,
    capacity: metricSchema,
  }),

  lastUpdatedAt: z.string(),
});

export type PlantChartExportResponse = {
  fileName: string;
  downloadUrl: string;
  expiresAt: string;
};

export type PlantOverviewResponse = z.infer<typeof plantOverviewSchema>;
export type ChartResponse = z.infer<typeof chartResponseSchema>;
export type ApiLog = z.infer<typeof logSchema>;
export type ApiAlert = z.infer<typeof alertSchema>;
export type PlantInformation = z.infer<typeof plantInformationSchema>;
