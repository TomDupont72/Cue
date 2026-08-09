import type { InvalidateQueryFilters } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

type UserCacheInvalidationPolicy = (seriesId: number) => readonly InvalidateQueryFilters[];
type UserCacheCommand =
  "episodeAdded" | "episodeRemoved" | "seasonAdded" | "seasonRemoved" | "seriesChanged";

const invalidateUserProjections: UserCacheInvalidationPolicy = (seriesId) => [
  {
    queryKey: queryKeys.series.detail(seriesId),
    exact: true
  },
  {
    queryKey: queryKeys.userSeries.all
  },
  {
    queryKey: queryKeys.userDashboard.all
  },
  {
    queryKey: queryKeys.userEpisodes.all
  }
];

export const userCachePolicy = {
  episodeAdded: invalidateUserProjections,
  episodeRemoved: invalidateUserProjections,
  seasonAdded: invalidateUserProjections,
  seasonRemoved: invalidateUserProjections,
  seriesChanged: invalidateUserProjections
} satisfies Record<UserCacheCommand, UserCacheInvalidationPolicy>;
