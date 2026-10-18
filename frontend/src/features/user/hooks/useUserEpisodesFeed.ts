import { useQuery } from "@tanstack/react-query";

import { userEpisodesFeedGet } from "@/features/user/api/user.api";
import { preserveFeedOrder } from "@/features/user/utils/episodeFeedOrder";
import { queryKeys } from "@/lib/queryKeys";

export function useUserEpisodesFeed() {
  return useQuery({
    queryKey: queryKeys.userEpisodes.feed(),
    queryFn: () => userEpisodesFeedGet(),
    structuralSharing: preserveFeedOrder,
    staleTime: 5 * 60 * 1000
  });
}
