import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type {
  UserSeriesFacetLabels,
  UserSeriesFacetLabelsFor,
  UserSeriesFacetSchema,
  UserSeriesFiltersFor,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import type { FacetMetrics, FacetOptionsConfig } from "@/lib/facets/facet.types";

import { GENRE_KEY_BY_NAME } from "@/features/genre/constants/genreName";
import { useUserSeriesTable } from "@/features/user/hooks/useUserSeriesTable";
import {
  buildDisplayedUserSeriesGroups,
  buildUserSeriesFilterOptionCatalog,
  updateUserSeriesFilterOptionMetrics
} from "@/features/user/utils/userSeriesView";

type UserSeries = UserSeriesGetResponse["series"][number];
type FacetMetric = keyof FacetMetrics;
type FacetMetricNamesFor<TMetric extends FacetMetric> = Pick<Record<FacetMetric, string>, TMetric>;

type UseUserSeriesViewParams<TKey extends UserSeriesGroupBy, TMetric extends FacetMetric> = {
  series: UserSeries[];
  filters: UserSeriesFiltersFor<TKey>;
  optionConfig?: FacetOptionsConfig<Pick<UserSeriesFacetSchema, NoInfer<TKey>>>;
  metricKeys?: readonly TMetric[];
  groupBy?: UserSeriesGroupBy;
};

export function useUserSeriesView<
  TKey extends UserSeriesGroupBy,
  TMetric extends FacetMetric = never
>({ series, filters, optionConfig, metricKeys, groupBy }: UseUserSeriesViewParams<TKey, TMetric>) {
  const { t } = useTranslation();
  const hasStatus = Object.hasOwn(filters, "status");
  const hasGenre = Object.hasOwn(filters, "genre");
  const hasProvider = Object.hasOwn(filters, "provider");
  const facetKeys = useMemo(
    () =>
      [
        ...(hasStatus ? (["status"] as const) : []),
        ...(hasGenre ? (["genre"] as const) : []),
        ...(hasProvider ? (["provider"] as const) : [])
      ] as TKey[],
    [hasStatus, hasGenre, hasProvider]
  );

  const filterOptionCatalog = useMemo(
    () =>
      buildUserSeriesFilterOptionCatalog({
        series,
        facetKeys,
        optionConfig,
        otherLabel: t("common:labels.others"),
        getStatusLabel: (status) => t(`user:series.status.${status}.section`),
        getGenreLabel: (name) => t(`genre:${GENRE_KEY_BY_NAME[name] ?? "UNKNOWN"}`)
      }),
    [series, facetKeys, optionConfig, t]
  );

  const { groups, facetMetrics } = useUserSeriesTable({
    series,
    filters,
    optionValues: filterOptionCatalog.optionValues,
    groupBy
  });

  const categoryNames = useMemo(() => {
    const names: Partial<UserSeriesFacetLabels> = {};

    for (const facetKey of facetKeys) {
      switch (facetKey) {
        case "status":
          names.status = t("series:dashboard.categories.status");
          break;

        case "genre":
          names.genre = t("series:dashboard.categories.genre");
          break;

        case "provider":
          names.provider = t("series:dashboard.categories.provider");
          break;
      }
    }

    return names as UserSeriesFacetLabelsFor<TKey>;
  }, [facetKeys, t]);

  const metricNames = useMemo(() => {
    const names: Partial<Record<FacetMetric, string>> = {};

    for (const metricKey of metricKeys ?? []) {
      switch (metricKey) {
        case "count":
          names.count = t("common:labels.total");
          break;

        case "watchedMinutes":
          names.watchedMinutes = t("user:stats.watchTime");
          break;
      }
    }

    return names as FacetMetricNamesFor<TMetric>;
  }, [metricKeys, t]);

  const filterOptions = useMemo(
    () => updateUserSeriesFilterOptionMetrics(filterOptionCatalog.options, facetMetrics, facetKeys),
    [filterOptionCatalog.options, facetMetrics, facetKeys]
  );

  const displayedGroups = useMemo(
    () =>
      groupBy
        ? buildDisplayedUserSeriesGroups({
            groups,
            groupBy,
            getStatusLabel: (status) => t(`user:series.status.${status}.section`),
            getGenreLabel: (name) => t(`genre:${GENRE_KEY_BY_NAME[name] ?? "UNKNOWN"}`)
          })
        : [],
    [groups, groupBy, t]
  );

  return {
    categoryNames,
    metricNames,
    filterOptions,
    displayedGroups
  };
}
