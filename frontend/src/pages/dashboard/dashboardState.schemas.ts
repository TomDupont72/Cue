import { z } from "zod";

import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";
import { facetSelectionSearchParamSchema } from "@/lib/facets/facet.schemas";

export const dashboardStateSchema = z.object({
  groupBy: z
    .enum(["status", "genre", "provider"])
    .nullable()
    .transform((value) => value ?? "status"),
  filters: z
    .object({
      statuses: facetSelectionSearchParamSchema(z.enum(USER_SERIES_STATUS)),
      genres: facetSelectionSearchParamSchema(
        z.string().transform(Number).pipe(z.number().int().min(1))
      ),
      providers: facetSelectionSearchParamSchema(
        z.string().transform(Number).pipe(z.number().int().min(1))
      )
    })
    .transform(({ statuses, genres, providers }) => ({
      status: statuses,
      genre: genres,
      provider: providers
    }))
});
