import { Card, CardContent } from "@/components/ui/card";
import type { SeriesGetEpisode } from "../types/series.types";
import { getTmdbImageUrl } from "@/lib/tmdbImage";
import { ImageOff } from "lucide-react";
import { RoundedCheckbox } from "@/components/layout/roundedCheckbox";
import { Badge } from "@/components/ui/badge";
import { useUserEpisodePost } from "@/features/user/hooks/useUserEpisodePost";
import { useUserEpisodeDelete } from "@/features/user/hooks/useUserEpisodeDelete";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EpisodeCardDetails from "./episodeCardDetails";
import { differenceInCalendarDays } from "date-fns";

type EpisodeCardProps = {
  seriesId: number;
  episode: SeriesGetEpisode;
  watchedEpisodeIds: Set<number>;
};

export default function EpisodeCard({ seriesId, episode, watchedEpisodeIds }: EpisodeCardProps) {
  const stillUrl = getTmdbImageUrl(episode.stillPath);
  const isWatched = watchedEpisodeIds.has(episode.id);

  const userEpisodePostMutation = useUserEpisodePost();
  const userEpisodeDeleteMutation = useUserEpisodeDelete();

  function handleCheckedChange(checked: boolean) {
    const params = {
      seriesId,
      episodeId: episode.id
    };

    if (checked) {
      userEpisodePostMutation.mutate(params);
    } else {
      userEpisodeDeleteMutation.mutate(params);
    }
  }

  const remainingDays = episode.airDate
    ? differenceInCalendarDays(new Date(episode.airDate), new Date())
    : null;

  return (
    <Dialog>
      <div className="group relative rounded-xl transition-transform hover:-translate-y-1 hover:shadow-md">
        <DialogTrigger
          render={
            <Card className="cursor-pointer flex flex-row h-24 overflow-hidden p-0">
              <div className="w-24 shrink-0 overflow-hidden bg-muted">
                {stillUrl ? (
                  <img
                    src={stillUrl}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-8" />
                  </div>
                )}
              </div>
              <CardContent
                className={`flex min-w-0 flex-1 flex-col justify-center ${
                  remainingDays === null || remainingDays > 0 ? "mr-28" : "mr-16"
                }`}
              >
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
            </Card>
          }
        />
        {remainingDays === null ? (
          <h2 className="absolute right-4 top-1/2 z-10 -translate-y-1/2 font-bold text-xl">
            À venir
          </h2>
        ) : remainingDays > 0 ? (
          <h2 className="absolute right-4 top-1/2 z-10 -translate-y-1/2 font-bold text-xl">
            {remainingDays} Jour{remainingDays > 1 ? "s" : ""}
          </h2>
        ) : (
          <RoundedCheckbox
            checked={isWatched}
            onChange={handleCheckedChange}
            disabled={userEpisodePostMutation.isPending || userEpisodeDeleteMutation.isPending}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2"
          />
        )}
      </div>

      <DialogContent className="overflow-hidden p-0">
        <EpisodeCardDetails
          episode={episode}
          isWatched={isWatched}
          onCheckedChange={handleCheckedChange}
          isPending={userEpisodePostMutation.isPending || userEpisodeDeleteMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
