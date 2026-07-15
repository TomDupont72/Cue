import { Card, CardContent } from "@/components/ui/card";
import type { SeriesGetEpisode } from "../types/series.types";
import { getTmdbImageUrl } from "@/lib/tmdbImage";
import { ImageOff } from "lucide-react";
import { RoundedCheckbox } from "@/components/layout/roundedCheckbox";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type EpisodeCardProps = {
  episode: SeriesGetEpisode;
  watchedEpisodeIds: Set<number>;
};

export default function EpisodeCard({ episode, watchedEpisodeIds }: EpisodeCardProps) {
  const stillUrl = getTmdbImageUrl(episode.stillPath);

  const [checked, setChecked] = useState(watchedEpisodeIds.has(episode.id));

  return (
    <Card className="flex flex-row h-24 group overflow-hidden p-0">
      <div className="w-24 shrink-0 overflow-hidden bg-muted">
        {stillUrl ? (
          <img src={stillUrl} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
      </div>
      <CardContent className="flex min-w-0 flex-1 flex-col justify-center">
        {episode.seasonNumber !== 0 ? (
          <>
            <h2 className="truncate font-bold text-xl">
              S{episode.seasonNumber} | E{episode.episodeNumber}
            </h2>
            <p className="truncate">{episode.name}</p>
          </>
        ) : (
          <>
            <p className="truncate">{episode.name}</p>
            <Badge>Spécial</Badge>
          </>
        )}
      </CardContent>
      <RoundedCheckbox
        checked={checked}
        onChange={setChecked}
        className="mr-6 shrink-0 self-center"
      />
    </Card>
  );
}
