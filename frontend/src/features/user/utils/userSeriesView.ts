import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type {
  UserSeriesFacetMetrics,
  UserSeriesFacetMetricsFor,
  UserSeriesFacetSchema,
  UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";
import type { UserSeriesGroup } from "@/features/user/utils/userSeriesTable";
import type {
  FacetMetricsGetter,
  FacetOption,
  FacetOptionConfig,
  FacetOptions,
  FacetOptionsConfig,
  FacetOptionValues,
  FacetValue
} from "@/lib/facets/facet.types";

import {
  USER_SERIES_STATUS,
  type UserSeriesStatus
} from "@/features/user/constants/userSeriesStatus";
import { createFacetMetrics, keepFirstFilters } from "@/lib/facets/tanstackTableFacets";

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

type UserSeriesFacetOptionsFor<TKey extends UserSeriesGroupBy> = Pick<
  FacetOptions<UserSeriesFacetSchema>,
  TKey
>;

type UserSeriesFacetOptionValuesFor<TKey extends UserSeriesGroupBy> = Pick<
  FacetOptionValues<UserSeriesFacetSchema>,
  TKey
>;

type BuildFilterOptionsParams<TKey extends UserSeriesGroupBy> = LabelResolvers & {
  series: UserSeries[];
  facetKeys: readonly TKey[];
  optionConfig?: FacetOptionsConfig<UserSeriesFacetSchema>;
  otherLabel: string;
};

export function buildUserSeriesFilterOptionCatalog<TKey extends UserSeriesGroupBy>({
  series,
  facetKeys,
  optionConfig,
  otherLabel,
  getStatusLabel,
  getGenreLabel
}: BuildFilterOptionsParams<TKey>): {
  options: UserSeriesFacetOptionsFor<TKey>;
  optionValues: UserSeriesFacetOptionValuesFor<TKey>;
} {
  const options: Partial<FacetOptions<UserSeriesFacetSchema>> = {};
  const optionValues: Partial<FacetOptionValues<UserSeriesFacetSchema>> = {};

  for (const facetKey of facetKeys) {
    switch (facetKey) {
      case "status": {
        const allOptions: FacetOption<UserSeriesStatus>[] = USER_SERIES_STATUS_ORDER.map(
          (value) => ({
            id: String(value),
            values: [value],
            label: getStatusLabel(value),
            count: 0,
            watchedMinutes: 0
          })
        );
        const displayedOptions = limitFacetOptions(
          allOptions,
          optionConfig?.status,
          otherLabel,
          () =>
            createFacetMetrics(
              series.map((item) => ({
                values: [item.status],
                watchedMinutes: item.watchedMinutes
              }))
            )
        );

        options.status = displayedOptions;
        optionValues.status = createFacetOptionValues(allOptions, displayedOptions);
        break;
      }

      case "genre": {
        const genresById = new Map<number, string>();

        for (const item of series) {
          for (const genre of item.seriesGenres) {
            genresById.set(genre.id, genre.name);
          }
        }

        const allOptions: FacetOption<number>[] = Array.from(genresById, ([value, name]) => ({
          id: String(value),
          values: [value],
          label: getGenreLabel(name),
          count: 0,
          watchedMinutes: 0
        })).sort((first, second) => first.label.localeCompare(second.label));
        const displayedOptions = limitFacetOptions(
          allOptions,
          optionConfig?.genre,
          otherLabel,
          () =>
            createFacetMetrics(
              series.map((item) => ({
                values: item.seriesGenres.map((genre) => genre.id),
                watchedMinutes: item.watchedMinutes
              }))
            )
        );

        options.genre = displayedOptions;
        optionValues.genre = createFacetOptionValues(allOptions, displayedOptions);
        break;
      }

      case "provider": {
        const providersById = new Map<number, string>();

        for (const item of series) {
          for (const provider of item.seriesProviders) {
            providersById.set(provider.id, provider.name);
          }
        }

        const allOptions: FacetOption<number>[] = Array.from(providersById, ([value, name]) => ({
          id: String(value),
          values: [value],
          label: name,
          count: 0,
          watchedMinutes: 0
        })).sort((first, second) => first.label.localeCompare(second.label));
        const displayedOptions = limitFacetOptions(
          allOptions,
          optionConfig?.provider,
          otherLabel,
          () =>
            createFacetMetrics(
              series.map((item) => ({
                values: item.seriesProviders.map((provider) => provider.id),
                watchedMinutes: item.watchedMinutes
              }))
            )
        );

        options.provider = displayedOptions;
        optionValues.provider = createFacetOptionValues(allOptions, displayedOptions);
        break;
      }
    }
  }

  return {
    options: options as UserSeriesFacetOptionsFor<TKey>,
    optionValues: optionValues as UserSeriesFacetOptionValuesFor<TKey>
  };
}

function limitFacetOptions<T extends FacetValue>(
  options: FacetOption<T>[],
  config: FacetOptionConfig | undefined,
  otherLabel: string,
  createMetrics: () => FacetMetricsGetter<T>
): FacetOption<T>[] {
  if (!config || config.limit < 0 || config.limit >= options.length) {
    return options;
  }

  const metrics = createMetrics();
  const optionsWithMetrics = options.map((option) => ({
    ...option,
    ...metrics.get(option.values)
  }));

  return keepFirstFilters(optionsWithMetrics, metrics, otherLabel, config);
}

function createFacetOptionValues<T extends FacetValue>(
  allOptions: readonly FacetOption<T>[],
  displayedOptions: readonly FacetOption<T>[]
): ReadonlyMap<string, readonly T[]> {
  return new Map(
    [...allOptions, ...displayedOptions].map((option) => [option.id, option.values] as const)
  );
}

export function updateUserSeriesFilterOptionMetrics<TKey extends UserSeriesGroupBy>(
  options: UserSeriesFacetOptionsFor<TKey>,
  facetMetrics: UserSeriesFacetMetricsFor<TKey>,
  facetKeys: readonly TKey[]
): UserSeriesFacetOptionsFor<TKey> {
  const currentOptions = options as Partial<FacetOptions<UserSeriesFacetSchema>>;
  const metrics = facetMetrics as Partial<UserSeriesFacetMetrics>;
  const updatedOptions: Partial<FacetOptions<UserSeriesFacetSchema>> = {};

  for (const facetKey of facetKeys) {
    switch (facetKey) {
      case "status":
        updatedOptions.status = currentOptions.status!.map((option) => ({
          ...option,
          ...metrics.status!.get(option.values)
        }));
        break;

      case "genre":
        updatedOptions.genre = currentOptions.genre!.map((option) => ({
          ...option,
          ...metrics.genre!.get(option.values)
        }));
        break;

      case "provider":
        updatedOptions.provider = currentOptions.provider!.map((option) => ({
          ...option,
          ...metrics.provider!.get(option.values)
        }));
        break;
    }
  }

  return updatedOptions as UserSeriesFacetOptionsFor<TKey>;
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
