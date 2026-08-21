import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { userEpisodesUpcomingGet } from "../api/user.api";

export function useUserEpisodesUpcoming() {
  return useQuery({
    queryKey: queryKeys.userEpisodes.upcoming(),
    queryFn: () => userEpisodesUpcomingGet(),
    staleTime: 5 * 60 * 1000
  });
}
