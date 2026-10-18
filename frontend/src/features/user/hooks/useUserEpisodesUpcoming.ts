import { useQuery } from "@tanstack/react-query";

import { userEpisodesUpcomingGet } from "@/features/user/api/user.api";
import { queryKeys } from "@/lib/queryKeys";

export function useUserEpisodesUpcoming() {
  return useQuery({
    queryKey: queryKeys.userEpisodes.upcoming(),
    queryFn: () => userEpisodesUpcomingGet(),
    staleTime: 5 * 60 * 1000
  });
}
