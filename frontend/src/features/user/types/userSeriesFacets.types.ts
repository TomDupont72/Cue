import type { UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";
import type {
  FacetFilters,
  FacetLabels,
  FacetMetrics,
  FacetMetricsBySchema
} from "@/lib/facets/facet.types";

export const RECENTLY_WATCHED_VALUES = [
  "day",
  "week",
  "month",
  "months3",
  "months6",
  "year",
  "other"
] as const;

export type UserRecentlyWatched = (typeof RECENTLY_WATCHED_VALUES)[number];

const DAY_IN_MILLISECONDS = 86_400_000;

export const RECENTLY_WATCHED_PERIODS = {
  day: DAY_IN_MILLISECONDS,
  week: 7 * DAY_IN_MILLISECONDS,
  month: 30 * DAY_IN_MILLISECONDS,
  months3: 91 * DAY_IN_MILLISECONDS,
  months6: 182 * DAY_IN_MILLISECONDS,
  year: 365 * DAY_IN_MILLISECONDS
} as const satisfies Record<Exclude<UserRecentlyWatched, "other">, number>;

export const TIME_REMAINING_VALUES = [
  "under2Hours",
  "under6Hours",
  "under12Hours",
  "underDay",
  "overDay"
] as const;

export type UserTimeRemaining = (typeof TIME_REMAINING_VALUES)[number];

const HOUR_IN_MINUTES = 60;

export const TIME_REMAINING_LIMITS = {
  under2Hours: 2 * HOUR_IN_MINUTES,
  under6Hours: 6 * HOUR_IN_MINUTES,
  under12Hours: 12 * HOUR_IN_MINUTES,
  underDay: 24 * HOUR_IN_MINUTES
} as const satisfies Record<Exclude<UserTimeRemaining, "overDay">, number>;

export type UserSeriesFacetSchema = {
  status: UserSeriesStatus;
  genre: number;
  provider: number;
  recentlyWatched: UserRecentlyWatched;
  timeRemaining: UserTimeRemaining;
};

export type UserSeriesFacetKey = keyof UserSeriesFacetSchema;

export type UserSeriesFilterKey = "status" | "genre" | "provider";

export type UserSeriesStatsGroupBy = "genre" | "provider";

export type UserSeriesGroupBy = "status" | "recentlyWatched" | "timeRemaining";

export type UserSeriesFilterSchema = Pick<UserSeriesFacetSchema, UserSeriesFilterKey>;

export type UserSeriesFilters = FacetFilters<UserSeriesFilterSchema>;

export type UserSeriesFacetLabels = FacetLabels<UserSeriesFacetSchema>;

export type UserSeriesFacetMetrics = FacetMetricsBySchema<UserSeriesFacetSchema>;

export type UserSeriesFiltersFor<TKey extends UserSeriesFilterKey> = Pick<UserSeriesFilters, TKey>;

export type UserSeriesFacetLabelsFor<TKey extends UserSeriesFacetKey> = Pick<
  UserSeriesFacetLabels,
  TKey
>;

export type UserSeriesFacetMetricsFor<TKey extends UserSeriesFilterKey> = Pick<
  UserSeriesFacetMetrics,
  TKey
>;

export const SERIES_DATA_METRICS = [
  "count",
  "watchedMinutes"
] as const satisfies readonly (keyof FacetMetrics)[];

export type SeriesDataMetric = (typeof SERIES_DATA_METRICS)[number];
