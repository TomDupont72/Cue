import { Card, CardContent } from "@/components/ui/card";
import { getTmdbImageUrl } from "@/lib/tmdbImage";
import { ImageOff } from "lucide-react";
import { getYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/features/user/components/statusBadge";
import type { SeriesGetSeries, SeriesGetUserSeries } from "../types/series.types";
import StatusProgressBar from "@/features/user/components/statusProgressBar";
import SeriesProductionBadge from "./seriesProductionBadge";
import { useUserSeriesMutation } from "@/features/user/hooks/useUserSeriesMutation";

type SeriesOverviewProps = {
  series: SeriesGetSeries;
  userSeries: SeriesGetUserSeries | null;
  isProgress?: boolean;
  watchProgress?: number;
};

export function SeriesOverview({
  series,
  userSeries,
  isProgress = false,
  watchProgress
}: SeriesOverviewProps) {
  const backdropUrl = getTmdbImageUrl(series.backdropPath, "original");
  const startYear = getYear(series.firstAirDate);
  const endYear = getYear(series.lastAirDate);

  const userSeriesPostMutation = useUserSeriesMutation();

  return (
    <Card className="group overflow-hidden p-0">
      <div className="overflow-hidden bg-muted">
        <div className="h-56 w-full overflow-hidden sm:h-72 lg:h-96">
          {backdropUrl ? (
            <img src={backdropUrl} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" />
            </div>
          )}
        </div>
        {isProgress ? (
          <StatusProgressBar value={watchProgress ?? 0} status={userSeries?.status ?? "PLANNED"} />
        ) : null}
      </div>

      <CardContent className="flex flex-col gap-4 pb-4">
        <div className="flex flex-col gap-4">
          <h2 className="font-medium text-3xl">
            {series.name} ({series.originalName})
          </h2>
          <div className="flex flex-row gap-3">
            <SeriesProductionBadge inProduction={series.inProduction} />
            {userSeries ? <StatusBadge status={userSeries.status} /> : null}
          </div>
          <p className="text-muted-foreground">
            {startYear} - {series.inProduction ? "présent" : endYear} • {series.numberOfSeasons}{" "}
            saison{series.numberOfSeasons > 1 ? "s" : ""} • {series.numberOfEpisodes} épisode
            {series.numberOfEpisodes > 1 ? "s" : ""}
          </p>
        </div>
        <p>{series.overview}</p>
      </CardContent>

      <div>
        {!userSeries ? (
          <Button
            variant="secondary"
            className="h-full w-full p-1 rounded-none text-lg"
            onClick={() => userSeriesPostMutation.mutate({ seriesId: series.id }, {})}
          >
            Ajouter la série
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
