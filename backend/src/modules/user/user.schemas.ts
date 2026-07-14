import z from "zod";

export const userSeriesStatuses = [
  "PLANNED",
  "WATCHING",
  "COMPLETED",
  "DROPPED",
  "PAUSED"
] as const;

export const userSeriesPostBodySchema = z.object({
  status: z.enum(userSeriesStatuses).optional(),
  isFavorite: z.boolean().optional()
});

export const userSeriesPostParamsSchema = z.object({
  seriesId: z.coerce.number().int().min(1)
});

export type UserSeriesPostBody = z.infer<typeof userSeriesPostBodySchema>;
export type UserSeriesPostParams = z.infer<typeof userSeriesPostParamsSchema>;
