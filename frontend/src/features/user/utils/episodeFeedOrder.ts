import type { UserEpisodesFeedGetResponse } from "@/features/user/types/user.types";

function preserveSectionOrder(
  previous: UserEpisodesFeedGetResponse["WATCHING"],
  next: UserEpisodesFeedGetResponse["WATCHING"]
) {
  const nextBySeriesId = new Map(next.map((item) => [item.seriesId, item]));
  const previousIds = new Set(previous.map((item) => item.seriesId));

  const newItems = next.filter((item) => !previousIds.has(item.seriesId));

  const existingItems = previous.flatMap(({ seriesId }) => {
    const freshItem = nextBySeriesId.get(seriesId);
    return freshItem ? [freshItem] : [];
  });

  return [...newItems, ...existingItems];
}

export function preserveFeedOrder(
  previousData: unknown | undefined,
  newData: unknown
): UserEpisodesFeedGetResponse {
  const next = newData as UserEpisodesFeedGetResponse;
  const previous = previousData as UserEpisodesFeedGetResponse | undefined;

  if (!previous) {
    return next;
  }

  return {
    WATCHING: preserveSectionOrder(previous.WATCHING, next.WATCHING),
    PAUSED: preserveSectionOrder(previous.PAUSED, next.PAUSED),
    DROPPED: preserveSectionOrder(previous.DROPPED, next.DROPPED)
  };
}
