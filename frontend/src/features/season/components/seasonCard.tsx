import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SeriesGetEpisode, SeriesGetSeason } from "@/features/series/types/series.types";
import EpisodeCard from "@/features/episode/components/episodeCard";
import { RoundedCheckbox } from "@/components/layout/roundedCheckbox";
import { useUserSeasonPost } from "@/features/user/hooks/useUserSeasonPost";

type SeasonCardProps = {
  seriesId: number;
  season: SeriesGetSeason;
  episodes: SeriesGetEpisode[];
  watchedEpisodeIds: Set<number>;
};

export default function SeasonCard({
  seriesId,
  season,
  episodes,
  watchedEpisodeIds
}: SeasonCardProps) {
  const watchedCount = episodes.filter((episode) => watchedEpisodeIds.has(episode.id)).length;

  const userSeasonPostMutation = useUserSeasonPost();

  function handleCheckedChange(checked: boolean) {
    const params = {
      seriesId,
      seasonId: season.id
    };

    if (checked) {
      userSeasonPostMutation.mutate(params);
    }
  }

  if (episodes.length === 0) {
    return null;
  }

  return (
    <AccordionItem className="mx-auto w-full sm:max-w-9/10 md:max-w-7/10 lg:max-w-7/10  border-none">
      <div className="relative my-3">
        <AccordionTrigger
          className="rounded-xl
      border
      bg-card
      px-4
      py-4
      pr-16
      hover:no-underline"
          left={
            <h2 className="font-bold text-xl">
              {season.seasonNumber !== 0 ? `Saison ${season.seasonNumber}` : "Épisodes spéciaux"}
            </h2>
          }
          right={
            <div className="flex items-center ml-auto gap-4">
              <p>
                {watchedCount}/{episodes.length}
              </p>
            </div>
          }
        />
        <RoundedCheckbox
          checked={watchedCount === episodes.length}
          onChange={handleCheckedChange}
          disabled={userSeasonPostMutation.isPending}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2"
        />
      </div>

      <AccordionContent className="flex flex-col gap-4">
        {episodes.map((episode) => (
          <EpisodeCard
            key={episode.id}
            seriesId={seriesId}
            episode={episode}
            watchedEpisodeIds={watchedEpisodeIds}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
