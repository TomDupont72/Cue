import { LoadingState } from "@/components/feedback/loadingState";
import { useSeries } from "@/features/series/hooks/useSeries";
import { ErrorState } from "@/components/feedback/errorState";
import SeasonCard from "@/features/season/components/seasonCard";
import { Accordion } from "@/components/ui/accordion";
import type { EpisodeRow } from "@/features/episode/types/episode.types";

type SeriesDetailsProps = {
  id: number;
};

export default function SeriesDetails({ id }: SeriesDetailsProps) {
  const seriesQuery = useSeries(id);

  if (seriesQuery.isPending) {
    return <LoadingState />;
  }

  if (seriesQuery.isError) {
    return <ErrorState error={seriesQuery.error} onRetry={() => seriesQuery.refetch()} />;
  }

  const { series, seasons, episodes, userEpisodes } = seriesQuery.data;

  const sortedEpisodes = [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);

  const episodesBySeason = sortedEpisodes.reduce<Record<number, EpisodeRow[]>>((acc, episode) => {
    acc[episode.seasonNumber] ??= [];
    acc[episode.seasonNumber].push(episode);

    return acc;
  }, {});

  const watchedEpisodeIds = new Set(userEpisodes.map((userEpisode) => userEpisode.episodeId));

  const sortedSeasons = [...seasons].sort((a, b) => {
    if (a.seasonNumber === 0) return 1;
    if (b.seasonNumber === 0) return -1;

    return a.seasonNumber - b.seasonNumber;
  });

  return (
    <div className="flex flex-col items-center">
      <Accordion multiple>
        {sortedSeasons.map((season) => (
          <SeasonCard
            key={season.id}
            seriesId={series.id}
            season={season}
            episodes={episodesBySeason[season.seasonNumber] ?? []}
            watchedEpisodeIds={watchedEpisodeIds}
          />
        ))}
      </Accordion>
    </div>
  );
}
