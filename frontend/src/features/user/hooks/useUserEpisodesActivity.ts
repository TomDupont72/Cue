import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { userEpisodesActivityGet } from "@/features/user/api/user.api";
import { queryKeys } from "@/lib/queryKeys";

export function useUserEpisodesActivity(timezone: string, seriesIds?: number[]) {
  return useQuery({
    queryKey: queryKeys.userEpisodes.activity(timezone, seriesIds),
    queryFn: () => userEpisodesActivityGet(timezone, seriesIds),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData
  });
}
