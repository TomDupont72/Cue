import { z } from "zod";

import { facetSelectionSearchParamSchema } from "@/lib/facets/facet.schemas";

export const dashboardStateSchema = z.object({
  groupBy: z
    .enum(["status", "genre", "provider"])
    .nullable()
    .transform((value) => value ?? "status"),
  filters: z
    .object({
      statuses: facetSelectionSearchParamSchema(),
      genres: facetSelectionSearchParamSchema(),
      providers: facetSelectionSearchParamSchema()
    })
    .transform(({ statuses, genres, providers }) => ({
      status: statuses,
      genre: genres,
      provider: providers
    }))
});
