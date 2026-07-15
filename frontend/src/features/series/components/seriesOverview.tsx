import { Card, CardContent } from "@/components/ui/card";
import { getTmdbImageUrl } from "@/lib/tmdbImage";
import { ImageOff } from "lucide-react";
import { getYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/layout/statusBadge";
import type { SeriesGetSeries, SeriesGetUserSeries } from "../types/series.types";

type SeriesOverviewProps = {
  series: SeriesGetSeries;
  userSeries: SeriesGetUserSeries | null;
};

export function SeriesOverview({ series, userSeries }: SeriesOverviewProps) {
  const backdropUrl = getTmdbImageUrl(series.backdropPath, "original");
  const startYear = getYear(series.firstAirDate);
  const endYear = getYear(series.lastAirDate);

  return (
    <Card className="group overflow-hidden p-0">
      <div className="h-56 sm:h-72 lg:h-96 aspect-video overflow-hidden bg-muted">
        {backdropUrl ? (
          <img src={backdropUrl} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
      </div>

      <CardContent className="flex flex-col gap-4 pb-4">
        <div>
          <div className="flex flex-row items-center gap-4">
            <h2 className="font-medium text-3xl">
              {series.name} ({series.originalName})
            </h2>
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
          <Button variant="secondary" className="h-full w-full p-1 rounded-none text-lg">
            Ajouter la série
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
