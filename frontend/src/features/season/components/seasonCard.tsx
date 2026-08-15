import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import EpisodeCard from "@/features/episode/components/episodeCard";
import { RoundedCheckbox } from "@/components/layout/roundedCheckbox";
import { useUserSeasonMutation } from "@/features/user/hooks/useUserSeasonMutation";
import { useUserSeasonDelete } from "@/features/user/hooks/useUserSeasonDelete";
import { isEpisodeReleased } from "@/features/episode/utils/episodeRelease";
import type { SeasonCardEpisode, SeasonCardSeason } from "@/features/season/types/season.types";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/layout/heading";

type SeasonCardProps = {
  seriesId: number;
  season: SeasonCardSeason;
  episodes: SeasonCardEpisode[];
  watchedEpisodeIds: Set<number>;
};

export default function SeasonCard({
  seriesId,
  season,
  episodes,
  watchedEpisodeIds
}: SeasonCardProps) {
  const { t } = useTranslation();

  const now = new Date();
  const releasedEpisodes = episodes.filter((episode) => isEpisodeReleased(episode.airDate, now));
  const watchedCount = releasedEpisodes.filter((episode) =>
    watchedEpisodeIds.has(episode.id)
  ).length;

  const userSeasonPostMutation = useUserSeasonMutation();
  const userSeasonDeleteMutation = useUserSeasonDelete();

  function handleCheckedChange(checked: boolean) {
    const params = {
      seriesId,
      seasonId: season.id
    };

    if (checked) {
      userSeasonPostMutation.mutate(params);
    } else {
      userSeasonDeleteMutation.mutate(params);
    }
  }

  if (episodes.length === 0) {
    return null;
  }

  return (
    <AccordionItem className="border-none">
      <div className="relative my-3">
        <AccordionTrigger
          variant="card"
          left={
            <Heading level={2}>
              {season.seasonNumber !== 0
                ? t("series:seasonNumber", { number: season.seasonNumber })
                : t("series:specialEpisodes")}
            </Heading>
          }
          right={
            <div className="flex items-center ml-auto gap-4">
              <p>
                {watchedCount}/{releasedEpisodes.length}
              </p>
            </div>
          }
        />
        <RoundedCheckbox
          checked={releasedEpisodes.length > 0 && watchedCount === releasedEpisodes.length}
          onChange={handleCheckedChange}
          disabled={
            releasedEpisodes.length === 0 ||
            userSeasonPostMutation.isPending ||
            userSeasonDeleteMutation.isPending
          }
          absolute="right-center"
        />
      </div>

      <AccordionContent className="flex flex-col gap-4">
        {episodes.map((episode) => (
          <EpisodeCard
            key={episode.id}
            series={{ id: seriesId }}
            episode={episode}
            isWatched={watchedEpisodeIds.has(episode.id)}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
