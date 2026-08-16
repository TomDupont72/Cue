import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RoundedCheckbox } from "@/components/layout/roundedCheckbox";
import type { EpisodeCardEpisode } from "@/features/episode/types/episode.types";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/layout/heading";
import Picture from "@/components/layout/picture";

type EpisodeCardDetailsProps = {
  episode: EpisodeCardEpisode;
  isWatched: boolean;
  onCheckedChange: (checked: boolean) => void;
  isPending: boolean;
  remainingDays: number | null;
};

export default function EpisodeCardDetails({
  episode,
  isWatched,
  onCheckedChange,
  isPending,
  remainingDays
}: EpisodeCardDetailsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Picture path={episode.stillPath} size="original" />
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
        <DialogTitle className="font-bold text-xl">{episode.name}</DialogTitle>
        <Heading level={5}>
          {episode.seasonNumber === 0
            ? t("episode:specialEpisodeNumber", { number: episode.episodeNumber })
            : `${t("episode:seasonNumber", { number: episode.seasonNumber })} • ${t("episode:episodeNumber", { number: episode.episodeNumber })}`}
        </Heading>
      </DialogHeader>

      <DialogDescription className="flex px-4 pb-4">
        {episode.overview ? episode.overview : t("episode:noDescription")}
      </DialogDescription>
    </>
  );
}
