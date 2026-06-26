import { z } from "zod";

export const metricSchema = z.object({
  value: z.number(),
  unit: z.string(),
});

export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export const successSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data,
  });

export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    pagination: paginationSchema,
  });

export type Metric = z.infer<typeof metricSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
