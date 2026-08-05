import type {
  UserEpisodesFeedGetItem,
  UserEpisodesFeedGetResponse
} from "@/features/user/types/user.types";

type FeedSection = keyof UserEpisodesFeedGetResponse;

const sectionByStatus = {
  WATCHING: "watching",
  PAUSED: "paused",
  DROPPED: "dropped"
} as const;

export function updateUserEpisodesFeedItem(
  current: UserEpisodesFeedGetResponse,
  seriesId: number,
  nextItem: UserEpisodesFeedGetItem | null
): UserEpisodesFeedGetResponse {
  const sections: FeedSection[] = ["watching", "paused", "dropped"];
  const sourceSection = sections.find((section) =>
    current[section].some((item) => item.seriesId === seriesId)
  );
  const sourceIndex = sourceSection
    ? current[sourceSection].findIndex((item) => item.seriesId === seriesId)
    : -1;

  const updated = {
    watching: current.watching.filter((item) => item.seriesId !== seriesId),
    paused: current.paused.filter((item) => item.seriesId !== seriesId),
    dropped: current.dropped.filter((item) => item.seriesId !== seriesId)
  };

  if (!nextItem) {
    return updated;
  }

  const destinationSection = sectionByStatus[nextItem.status as keyof typeof sectionByStatus];

  if (!destinationSection) {
    return updated;
  }

  const destinationItems = [...updated[destinationSection]];

  if (destinationSection === sourceSection && sourceIndex >= 0) {
    destinationItems.splice(sourceIndex, 0, nextItem);
  } else {
    destinationItems.unshift(nextItem);
  }

  return {
    ...updated,
    [destinationSection]: destinationItems
  };
}
