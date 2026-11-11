import { z } from "zod";

import { facetSelectionSearchParamSchema } from "@/lib/facets/facet.schemas";

export const statsStateSchema = z.object({
  groupBy: z
    .enum(["genre", "provider"])
    .nullable()
    .transform((value) => value ?? "genre"),
  filters: z
    .object({
      genres: facetSelectionSearchParamSchema(),
      providers: facetSelectionSearchParamSchema()
    })
    .transform(({ genres, providers }) => ({
      genre: genres,
      provider: providers
    })),
  pieMetric: z
    .enum(["count", "watchedMinutes"])
    .nullable()
    .transform((value) => value ?? "count"),
  areaMetric: z
    .enum(["watchedEpisodes", "watchedMinutes"])
    .nullable()
    .transform((value) => value ?? "watchedEpisodes"),
  areaPeriod: z
    .enum(["all", "month", "months3", "months6", "year", "years2", "years5"])
    .nullable()
    .transform((value) => value ?? "months3"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .nullable()
    .transform((value) => value ?? 5),
  seriesIds: z
    .array(z.coerce.number().int().min(1))
    .transform((seriesIds) => [...new Set(seriesIds)])
});
