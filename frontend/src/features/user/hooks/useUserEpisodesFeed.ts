import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { userEpisodesFeedGet } from "../api/user.api";

export function useUserEpisodesFeed() {
  return useQuery({
    queryKey: queryKeys.userEpisodes.feed(),
    queryFn: () => userEpisodesFeedGet(),
    staleTime: 5 * 60 * 1000
  });
}
