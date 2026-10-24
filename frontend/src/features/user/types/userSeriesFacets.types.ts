import type { UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";
import type {
  FacetFilters,
  FacetLabels,
  FacetMetrics,
  FacetMetricsBySchema
} from "@/lib/facets/facet.types";

export type UserSeriesFacetSchema = {
  status: UserSeriesStatus;
  genre: number;
  provider: number;
};

export type UserSeriesFilters = FacetFilters<UserSeriesFacetSchema>;

export type UserSeriesFacetLabels = FacetLabels<UserSeriesFacetSchema>;

export type UserSeriesFacetMetrics = FacetMetricsBySchema<UserSeriesFacetSchema>;

export type UserSeriesGroupBy = keyof UserSeriesFacetSchema;

export type UserSeriesFiltersFor<TKey extends UserSeriesGroupBy> = Pick<UserSeriesFilters, TKey>;

export type UserSeriesFacetLabelsFor<TKey extends UserSeriesGroupBy> = Pick<
  UserSeriesFacetLabels,
  TKey
>;

export type UserSeriesFacetMetricsFor<TKey extends UserSeriesGroupBy> = Pick<
  UserSeriesFacetMetrics,
  TKey
>;

export const SERIES_DATA_METRICS = [
  "count",
  "watchedMinutes"
] as const satisfies readonly (keyof FacetMetrics)[];

export type SeriesDataMetric = (typeof SERIES_DATA_METRICS)[number];
