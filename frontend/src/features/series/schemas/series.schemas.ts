import { z } from "zod";

export const seriesSearchParamsSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "La recherche doit contenir au moins 2 caractères")
    .max(100, "La recherche est trop longue"),

  page: z.coerce.number().int().min(1).default(1)
});

export type SeriesSearchParams = z.infer<typeof seriesSearchParamsSchema>;
