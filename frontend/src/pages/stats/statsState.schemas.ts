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
  metric: z
    .enum(["count", "watchedMinutes"])
    .nullable()
    .transform((value) => value ?? "count"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .nullable()
    .transform((value) => value ?? 5)
});
