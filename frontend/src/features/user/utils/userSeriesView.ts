import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type {
  UserSeriesFacetCounts,
  UserSeriesFacetSchema,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import type { UserSeriesGroup } from "@/features/user/utils/userSeriesTable";
import type { FacetOptions } from "@/lib/facets/facet.types";

import {
  USER_SERIES_STATUS,
  type UserSeriesStatus
} from "@/features/user/constants/userSeriesStatus";

type UserSeries = UserSeriesGetResponse["series"][number];

export const USER_SERIES_STATUS_ORDER: readonly UserSeriesStatus[] = [
  USER_SERIES_STATUS.WATCHING,
  USER_SERIES_STATUS.PAUSED,
  USER_SERIES_STATUS.PLANNED,
  USER_SERIES_STATUS.COMPLETED,
  USER_SERIES_STATUS.DROPPED
];

type LabelResolvers = {
  getStatusLabel: (status: UserSeriesStatus) => string;
  getGenreLabel: (genreName: string) => string;
};

type BuildFilterOptionsParams = LabelResolvers & {
  series: UserSeries[];
  facetCounts: UserSeriesFacetCounts;
};

export function buildUserSeriesFilterOptions({
  series,
  facetCounts,
  getStatusLabel,
  getGenreLabel
}: BuildFilterOptionsParams): FacetOptions<UserSeriesFacetSchema> {
  const genresById = new Map<number, string>();
  const providersById = new Map<number, string>();

  for (const item of series) {
    for (const genre of item.seriesGenres) {
      genresById.set(genre.id, genre.name);
    }

    for (const provider of item.seriesProviders) {
      providersById.set(provider.id, provider.name);
    }
  }

  const status = USER_SERIES_STATUS_ORDER.map((value) => ({
    value,
    label: getStatusLabel(value),
    count: facetCounts.status.get(value) ?? 0
  }));

  const genre = Array.from(genresById, ([value, name]) => ({
    value,
    label: getGenreLabel(name),
    count: facetCounts.genre.get(value) ?? 0
  })).sort((first, second) => first.label.localeCompare(second.label));

  const provider = Array.from(providersById, ([value, name]) => ({
    value,
    label: name,
    count: facetCounts.provider.get(value) ?? 0
  })).sort((first, second) => first.label.localeCompare(second.label));

  return {
    status,
    genre,
    provider
  };
}

type BuildDisplayedGroupsParams = LabelResolvers & {
  groups: UserSeriesGroup[];
  groupBy: UserSeriesGroupBy;
};

export function buildDisplayedUserSeriesGroups({
  groups,
  groupBy,
  getStatusLabel,
  getGenreLabel
}: BuildDisplayedGroupsParams) {
  const displayedGroups = groups.map((group) => {
    let label: string;

    switch (groupBy) {
      case "status":
        label = getStatusLabel(group.value as UserSeriesStatus);
        break;

      case "genre":
        label = getGenreLabel(group.name);
        break;

      case "provider":
        label = group.name;
        break;
    }

    return {
      ...group,
      label
    };
  });

  if (groupBy === "status") {
    return displayedGroups.sort(
      (first, second) =>
        USER_SERIES_STATUS_ORDER.indexOf(first.value as UserSeriesStatus) -
        USER_SERIES_STATUS_ORDER.indexOf(second.value as UserSeriesStatus)
    );
  }

  return displayedGroups.sort((first, second) => first.label.localeCompare(second.label));
}
