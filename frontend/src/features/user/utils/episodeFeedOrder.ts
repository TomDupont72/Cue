import type { UserEpisodesFeedGetResponse } from "@/features/user/types/user.types";

function preserveSectionOrder(
  previous: UserEpisodesFeedGetResponse["watching"],
  next: UserEpisodesFeedGetResponse["watching"]
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
    watching: preserveSectionOrder(previous.watching, next.watching),
    paused: preserveSectionOrder(previous.paused, next.paused),
    dropped: preserveSectionOrder(previous.dropped, next.dropped)
  };
}
