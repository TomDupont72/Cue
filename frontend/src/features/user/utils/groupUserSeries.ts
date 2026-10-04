import type { UserSeriesGroupBy } from "@/features/user/types/userSeriesFacets.types";
import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import type { useTranslation } from "react-i18next";
import { GENRE_KEY_BY_NAME } from "@/features/genre/constants/genreName";

type UserSeries = UserSeriesGetResponse["series"][number];

export type UserSeriesGroup = {
  value: string | number;
  name: string;
  series: UserSeries[];
};

export function getGroupLabel(
  group: UserSeriesGroup,
  groupBy: UserSeriesGroupBy,
  t: ReturnType<typeof useTranslation>["t"]
): string {
  switch (groupBy) {
    case "status":
      return t(`user:series.status.${String(group.value)}.section`);

    case "genre":
      return t(`genre:${GENRE_KEY_BY_NAME[group.name] ?? "OTHER"}`);

    case "provider":
      return group.name;
  }
}

export function groupUserSeries(
  series: UserSeries[],
  groupBy: UserSeriesGroupBy
): UserSeriesGroup[] {
  const groups = new Map<string | number, UserSeriesGroup>();

  const addToGroup = (value: string | number, name: string, serie: UserSeries) => {
    const existingGroup = groups.get(value);

    if (existingGroup) {
      existingGroup.series.push(serie);
      return;
    }

    groups.set(value, {
      value,
      name,
      series: [serie]
    });
  };

  for (const serie of series) {
    if (groupBy === "status") {
      addToGroup(serie.status, serie.status, serie);
      continue;
    }

    if (groupBy === "genre") {
      for (const genre of serie.seriesGenres) {
        addToGroup(genre.id, genre.name, serie);
      }

      continue;
    }

    for (const provider of serie.seriesProviders) {
      addToGroup(provider.id, provider.name, serie);
    }
  }

  return Array.from(groups.values());
}
