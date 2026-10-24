import { z } from "zod";

import type { FacetSelection } from "@/lib/facets/facet.types";

function toFacetSelection(ids: string[] | null): FacetSelection {
  if (ids === null) {
    return { mode: "include", ids: [] };
  }

  if (ids.length === 0) {
    return { mode: "all" };
  }

  return { mode: "include", ids: [...new Set(ids)] };
}

export function facetSelectionSearchParamSchema() {
  return z
    .union([z.tuple([z.literal("null")]).transform(() => null), z.array(z.string().min(1))])
    .transform(toFacetSelection);
}
