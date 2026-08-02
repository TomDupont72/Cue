import { getTmdbImageUrl } from "@/lib/tmdbImage";
import type { SeriesGetEpisode } from "@/features/series/types/series.types";
import { ImageOff } from "lucide-react";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RoundedCheckbox } from "@/components/layout/roundedCheckbox";

type EpisodeCardDetailsProps = {
  episode: SeriesGetEpisode;
  isWatched: boolean;
  onCheckedChange: (checked: boolean) => void;
  isPending: boolean;
};

export default function EpisodeCardDetails({
  episode,
  isWatched,
  onCheckedChange,
  isPending
}: EpisodeCardDetailsProps) {
  const stillUrl = getTmdbImageUrl(episode.stillPath, "original");

  return (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {stillUrl ? (
          <img src={stillUrl} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        <RoundedCheckbox
          checked={isWatched}
          onChange={onCheckedChange}
          disabled={isPending}
          className="absolute right-3 bottom-3"
        />
      </div>

      <DialogHeader className="flex px-4">
        <DialogTitle className="font-bold text-xl">{episode.name}</DialogTitle>
        <p className="font-semibold">
          {episode.seasonNumber === 0
            ? `Épisode spécial ${episode.episodeNumber}`
            : `Saison ${episode.seasonNumber} • Épisode ${episode.episodeNumber}`}
        </p>
      </DialogHeader>

      <DialogDescription className="flex px-4 pb-4">
        {episode.overview ? episode.overview : "Pas de description disponible"}
      </DialogDescription>
    </>
  );
}
