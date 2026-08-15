import { Card, CardContent } from "@/components/ui/card";
import type { SeriesCardSeries } from "@/features/series/types/series.types";
import { getYear } from "@/lib/utils";
import StatusProgressBar from "@/features/user/components/statusProgressBar";
import type { UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/layout/text";
import Picture from "@/components/layout/picture";

type SeriesCardProps = {
  series: SeriesCardSeries;
  seriesId?: number;
  isProgress?: boolean;
  status?: UserSeriesStatus;
  watchProgress?: number;
};

export function SeriesCard({
  series,
  seriesId,
  isProgress = false,
  status,
  watchProgress
}: SeriesCardProps) {
  const { t } = useTranslation();

  const year = getYear(series.firstAirDate);

  const isImported = seriesId !== undefined;
  const destination = isImported ? `/series?id=${seriesId}` : "/series";
  const navigationState = isImported ? undefined : { tmdbId: series.tmdbId };

  return (
    <Link
      to={destination}
      state={navigationState}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="group overflow-hidden p-0 transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="overflow-hidden rounded-xl bg-muted">
          <div className="aspect-[2/3]">
            <Picture path={series.posterPath} hover />
          </div>

          {isProgress ? (
            <StatusProgressBar value={watchProgress ?? 0} status={status ?? "PLANNED"} />
          ) : null}
        </div>

        <CardContent className="flex flex-col gap-1 p-3">
          <Text className="truncate">{series.name}</Text>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {year ? <span>{year}</span> : <span>{t("common:date.unknown")}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
