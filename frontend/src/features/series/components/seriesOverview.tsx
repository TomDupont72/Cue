import { Card, CardContent } from "@/components/ui/card";
import { getYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/features/user/components/statusBadge";
import type { SeriesRow } from "@/features/series/types/series.types";
import StatusProgressBar from "@/features/user/components/statusProgressBar";
import SeriesProductionBadge from "@/features/series/components/seriesProductionBadge";
import { useUserSeriesMutation } from "@/features/user/hooks/useUserSeriesMutation";
import type { UserSeriesRow } from "@/features/user/types/user.types";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/layout/heading";
import { Text } from "@/components/layout/text";
import Picture from "@/components/layout/picture";

type SeriesOverviewProps = {
  series: SeriesRow;
  userSeries: UserSeriesRow | null;
  isProgress?: boolean;
  watchProgress?: number;
};

export function SeriesOverview({ series, userSeries, watchProgress }: SeriesOverviewProps) {
  const { t } = useTranslation();

  const userSeriesPostMutation = useUserSeriesMutation();

  const startYear = getYear(series.firstAirDate);
  const endYear = getYear(series.lastAirDate);

  return (
    <Card className="group overflow-hidden p-0">
      <div className="overflow-hidden bg-muted">
        <div className="h-56 w-full overflow-hidden sm:h-72 lg:h-96">
          <Picture path={series.backdropPath} size="original" />
        </div>
        {watchProgress !== undefined ? (
          <StatusProgressBar value={watchProgress ?? 0} status={userSeries?.status ?? "PLANNED"} />
        ) : null}
      </div>

      <CardContent className="flex flex-col gap-4 pb-4">
        <div className="flex flex-col gap-4">
          <Heading level={1}>
            {series.name} ({series.originalName})
          </Heading>
          <div className="flex flex-row gap-3">
            <SeriesProductionBadge inProduction={series.inProduction} />
            {userSeries ? <StatusBadge status={userSeries.status} /> : null}
          </div>
          <Text variant="muted">
            {startYear} - {series.inProduction ? t("series:dates.present") : endYear} •{" "}
            {t("series:season", { count: series.numberOfSeasons })} •{" "}
            {t("series:episode", { count: series.numberOfEpisodes })}
          </Text>
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
            {t("series:actions.addSeries").toUpperCase()}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
