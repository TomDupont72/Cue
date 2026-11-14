import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { EpisodeCardEpisode, EpisodeCardSeries } from "@/features/episode/types/episode.types";

import { Heading } from "@/components/layout/heading";
import Picture from "@/components/layout/picture";
import { RoundedCheckbox } from "@/components/layout/roundedCheckbox";
import { Text } from "@/components/layout/text";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SeriesLinkBadge } from "@/features/series/components/seriesLinkBadge";
import { durationToString } from "@/features/user/utils/dates";

type EpisodeCardDetailsProps = {
  episode: EpisodeCardEpisode;
  series: EpisodeCardSeries;
  isWatched: boolean;
  onCheckedChange: (checked: boolean) => void;
  isPending: boolean;
  remainingDays: number | null;
  displayName: boolean;
  displayEpisodeRedirection: boolean;
};

export default function EpisodeCardDetails({
  episode,
  series,
  isWatched,
  onCheckedChange,
  isPending,
  remainingDays,
  displayName = false,
  displayEpisodeRedirection = false
}: EpisodeCardDetailsProps) {
  const { t } = useTranslation();

  const path = episode.stillPath ?? series.backdropPath;

  return (
    <>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
        <Picture path={path} size="original" />
        {remainingDays !== null && remainingDays <= 0 ? (
          <RoundedCheckbox
            checked={isWatched}
            onChange={onCheckedChange}
            disabled={isPending}
            className="absolute right-3 bottom-3"
          />
        ) : null}
      </div>

      <DialogHeader className="flex px-4">
        {displayName && series.name ? (
          <SeriesLinkBadge seriesId={series.id} name={series.name} className="relative z-20 mb-1" />
        ) : null}
        <DialogTitle className="font-bold text-xl">{episode.name}</DialogTitle>
        <div className="flex gap-3">
          <Heading level={5} full={false}>
            {episode.seasonNumber === 0
              ? t("episode:specialEpisodeNumber", { number: episode.episodeNumber })
              : `${t("episode:seasonNumber", { number: episode.seasonNumber })} • ${t("episode:episodeNumber", { number: episode.episodeNumber })}`}
          </Heading>
          <Text variant="muted">
            {episode.runtime !== 0 ? durationToString(episode.runtime) : null}
          </Text>
        </div>
      </DialogHeader>

      <DialogDescription className="flex px-4 pb-4">
        {episode.overview ? episode.overview : t("episode:noDescription")}
      </DialogDescription>

      {displayEpisodeRedirection ? (
        <div className="flex justify-end px-4 pt-3 pb-4">
          <Button
            size="sm"
            className="font-bold"
            render={
              <Link
                to={`/series?id=${series.id}&view=details&seasonNumber=${episode.seasonNumber}&episodeNumber=${episode.episodeNumber}`}
              />
            }
          >
            {t("episode:goToEpisode").toUpperCase()}
            <ArrowRight />
          </Button>
        </div>
      ) : null}
    </>
  );
}
