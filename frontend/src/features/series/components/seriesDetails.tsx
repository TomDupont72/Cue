import SeasonCard from "@/features/season/components/seasonCard";
import { Accordion } from "@/components/ui/accordion";
import type { EpisodeRow } from "@/features/episode/types/episode.types";
import type {
  SeriesDetailsEpisode,
  SeriesDetailsSeason,
  SeriesDetailsUserEpisode
} from "@/features/series/types/series.types";
import ContentColumn from "@/components/layout/contentColumn";

type SeriesDetailsProps = {
  id: number;
  episodes: SeriesDetailsEpisode[];
  userEpisodes: SeriesDetailsUserEpisode[];
  seasons: SeriesDetailsSeason[];
  posterPath: string | null;
};

export default function SeriesDetails({
  id,
  episodes,
  userEpisodes,
  seasons,
  posterPath
}: SeriesDetailsProps) {
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
    <ContentColumn>
      <Accordion multiple>
        {sortedSeasons.map((season) => (
          <SeasonCard
            key={season.id}
            seriesId={id}
            season={season}
            posterPath={posterPath}
            episodes={episodesBySeason[season.seasonNumber] ?? []}
            watchedEpisodeIds={watchedEpisodeIds}
          />
        ))}
      </Accordion>
    </ContentColumn>
  );
}
