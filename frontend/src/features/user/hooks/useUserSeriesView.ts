import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type {
  UserSeriesFilters,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";

import { GENRE_KEY_BY_NAME } from "@/features/genre/constants/genreName";
import { useUserSeriesTable } from "@/features/user/hooks/useUserSeriesTable";
import {
  buildDisplayedUserSeriesGroups,
  buildUserSeriesFilterOptions
} from "@/features/user/utils/userSeriesView";

type UserSeries = UserSeriesGetResponse["series"][number];

type UseUserSeriesViewParams = {
  series: UserSeries[];
  filters: UserSeriesFilters;
  groupBy: UserSeriesGroupBy;
};

export function useUserSeriesView({ series, filters, groupBy }: UseUserSeriesViewParams) {
  const { t } = useTranslation();

  const { groups, facetCounts } = useUserSeriesTable({
    series,
    filters,
    groupBy
  });

  const categoryNames = useMemo(
    () => ({
      status: t("series:dashboard.categories.status"),
      genre: t("series:dashboard.categories.genre"),
      provider: t("series:dashboard.categories.provider")
    }),
    [t]
  );

  const filterOptions = useMemo(
    () =>
      buildUserSeriesFilterOptions({
        series,
        facetCounts,
        getStatusLabel: (status) => t(`user:series.status.${status}.section`),
        getGenreLabel: (name) => t(`genre:${GENRE_KEY_BY_NAME[name] ?? "OTHER"}`)
      }),
    [series, facetCounts, t]
  );

  const displayedGroups = useMemo(
    () =>
      buildDisplayedUserSeriesGroups({
        groups,
        groupBy,
        getStatusLabel: (status) => t(`user:series.status.${status}.section`),
        getGenreLabel: (name) => t(`genre:${GENRE_KEY_BY_NAME[name] ?? "OTHER"}`)
      }),
    [groups, groupBy, t]
  );

  return {
    categoryNames,
    filterOptions,
    displayedGroups
  };
}
