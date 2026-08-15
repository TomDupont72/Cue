import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { userEpisodesFeedGet } from "../api/user.api";
import { preserveFeedOrder } from "../utils/episodeFeedOrder";

export function useUserEpisodesFeed() {
  return useQuery({
    queryKey: queryKeys.userEpisodes.feed(),
    queryFn: () => userEpisodesFeedGet(),
    structuralSharing: preserveFeedOrder,
    staleTime: 5 * 60 * 1000
  });
}
