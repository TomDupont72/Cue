import { z } from "zod";

import type { FacetSelection, FacetValue } from "@/lib/facets/facet.types";

function toFacetSelection<T extends FacetValue>(values: T[] | null): FacetSelection<T> {
  if (values === null) {
    return { mode: "include", values: [] };
  }

  if (values.length === 0) {
    return { mode: "all" };
  }

  return { mode: "include", values };
}

export function facetSelectionSearchParamSchema<T extends FacetValue>(valueSchema: z.ZodType<T>) {
  return z
    .union([z.array(valueSchema), z.tuple([z.literal("null")]).transform(() => null)])
    .transform(toFacetSelection);
}
