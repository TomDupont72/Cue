import type { InvalidateQueryFilters } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

type UserCacheInvalidationPolicy = (seriesId: number) => readonly InvalidateQueryFilters[];
type UserCacheCommand =
  "episodeAdded" | "episodeRemoved" | "seasonAdded" | "seasonRemoved" | "seriesChanged";

type UserCacheInvalidationOptions = {
  refetchEpisodesFeed?: boolean;
};

function invalidateUserProjections(
  seriesId: number,
  { refetchEpisodesFeed = true }: UserCacheInvalidationOptions = {}
): readonly InvalidateQueryFilters[] {
  return [
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
      queryKey: queryKeys.userEpisodes.all,
      ...(!refetchEpisodesFeed && { refetchType: "none" as const })
    }
  ];
}

export const userCachePolicy = {
  // The response already patches the feed with the next episode. Refetching it here would
  // reorder the clicked series by lastWatchedAt and make the row jump to the top.
  episodeAdded: (seriesId: number) =>
    invalidateUserProjections(seriesId, { refetchEpisodesFeed: false }),
  episodeRemoved: invalidateUserProjections,
  seasonAdded: invalidateUserProjections,
  seasonRemoved: invalidateUserProjections,
  seriesChanged: invalidateUserProjections
} satisfies Record<UserCacheCommand, UserCacheInvalidationPolicy>;
