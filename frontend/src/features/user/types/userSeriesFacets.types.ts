import type { UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";
import type { FacetCounts, FacetFilters } from "@/lib/facets/facet.types";

export type UserSeriesFacetSchema = {
  status: UserSeriesStatus;
  genre: number;
  provider: number;
};

export type UserSeriesFilters = FacetFilters<UserSeriesFacetSchema>;

export type UserSeriesFacetCounts = FacetCounts<UserSeriesFacetSchema>;

export type UserSeriesGroupBy = keyof UserSeriesFacetSchema;
