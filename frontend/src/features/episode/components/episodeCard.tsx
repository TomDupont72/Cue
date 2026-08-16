import { Card, CardContent } from "@/components/ui/card";
import { RoundedCheckbox } from "@/components/layout/roundedCheckbox";
import { Badge } from "@/components/ui/badge";
import { useUserEpisodePost } from "@/features/user/hooks/useUserEpisodePost";
import { useUserEpisodeDelete } from "@/features/user/hooks/useUserEpisodeDelete";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EpisodeCardDetails from "@/features/episode/components/episodeCardDetails";
import type { EpisodeCardEpisode, EpisodeCardSeries } from "@/features/episode/types/episode.types";
import { getEpisodeReleaseDayDifference } from "@/features/episode/utils/episodeRelease";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/layout/heading";
import { Text } from "@/components/layout/text";
import Picture from "@/components/layout/picture";
import { SeriesLinkBadge } from "@/features/series/components/seriesLinkBadge";
import { cn } from "@/lib/utils";

type EpisodeCardProps = {
  series: EpisodeCardSeries;
  episode: EpisodeCardEpisode;
  isWatched: boolean;
  displayName?: boolean;
};

export default function EpisodeCard({
  series,
  episode,
  isWatched,
  displayName = false
}: EpisodeCardProps) {
  const { t } = useTranslation();

  const userEpisodePostMutation = useUserEpisodePost();
  const userEpisodeDeleteMutation = useUserEpisodeDelete();
  
  const remainingDays = getEpisodeReleaseDayDifference(episode.airDate);

  function handleCheckedChange(checked: boolean) {
    const params = {
      seriesId: series.id,
      episodeId: episode.id
    };

    if (checked) {
      userEpisodePostMutation.mutate(params);
    } else {
      userEpisodeDeleteMutation.mutate(params);
    }
  }

  return (
    <Dialog>
      <div className="group relative rounded-xl transition-transform hover:-translate-y-1 hover:shadow-md">
        <Card className="flex h-24 flex-row overflow-hidden p-0">
          <div className="w-24 shrink-0 overflow-hidden bg-muted">
            <Picture path={episode.stillPath} hover />
          </div>

          <CardContent
            className={cn(
              "flex min-w-0 flex-1 flex-col justify-center",
              remainingDays === null || remainingDays > 0 ? "mr-28" : "mr-16"
            )}
          >
            {episode.seasonNumber !== 0 ? (
              <>
                {displayName && series.name ? (
                  <SeriesLinkBadge
                    seriesId={series.id}
                    name={series.name}
                    className="relative z-20 mb-1"
                  />
                ) : null}

                <Heading level={2} className="truncate">
                  S{episode.seasonNumber} | E{episode.episodeNumber}
                </Heading>

                <Text variant="small" className="truncate">
                  {episode.name}
                </Text>
              </>
            ) : (
              <>
                <Text className="truncate">{episode.name}</Text>
                <Badge>{t("episode:special")}</Badge>
              </>
            )}
          </CardContent>
        </Card>

        <DialogTrigger
          type="button"
          aria-label={t("episode:openDetails", { name: episode.name })}
          className={cn(
            "absolute inset-0 z-10 cursor-pointer rounded-xl border-0 bg-transparent p-0",
            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
        />

        {remainingDays === null ? (
          <Heading
            level={2}
            absolute="right-center"
            full={false}
            className="pointer-events-none z-20"
          >
            {t("episode:incoming")}
          </Heading>
        ) : remainingDays > 0 ? (
          <Heading
            level={2}
            absolute="right-center"
            full={false}
            className="pointer-events-none z-20"
          >
            {t("episode:day", { count: remainingDays })}
          </Heading>
        ) : (
          <RoundedCheckbox
            checked={isWatched}
            onChange={handleCheckedChange}
            disabled={userEpisodePostMutation.isPending || userEpisodeDeleteMutation.isPending}
            absolute="right-center"
            className="z-20"
          />
        )}
      </div>

      <DialogContent className="overflow-hidden p-0">
        <EpisodeCardDetails
          episode={episode}
          isWatched={isWatched}
          onCheckedChange={handleCheckedChange}
          isPending={userEpisodePostMutation.isPending || userEpisodeDeleteMutation.isPending}
          remainingDays={remainingDays}
        />
      </DialogContent>
    </Dialog>
  );
}
