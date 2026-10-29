import { queryKeys } from "@/lib/queryKeys";
import { userEpisodesActivityGet } from "../api/user.api";
import { useQuery } from "@tanstack/react-query";

export function useUserEpisodesActivity(timezone: string, seriesIds?: number[]) {
    return useQuery({
        queryKey: queryKeys.userEpisodes.activity(timezone, seriesIds),
        queryFn: () => userEpisodesActivityGet(timezone, seriesIds),
        staleTime: 5 * 60 * 1000
    })
}