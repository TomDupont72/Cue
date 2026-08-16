import type { SeriesDisplaySeries } from "@/features/series/types/series.types";
import { SeriesCard } from "@/features/series/components/seriesCard";
import type { UserSeriesGetResponse } from "@/features/user/types/user.types";
import { getWatchProgress } from "@/features/user/utils/watchProgress";

type SeriesDisplayProps = {
  series: SeriesDisplaySeries[];
  userSeries?: UserSeriesGetResponse["items"];
};

export default function SeriesDisplay({ series, userSeries = [] }: SeriesDisplayProps) {
  return (
    <div
      className="
                  grid grid-cols-2 gap-4
                  sm:grid-cols-3
                  md:grid-cols-4
                  lg:grid-cols-5
                "
    >
      {series.map((data) => {
        const userData = userSeries.find((item) => item.seriesDetails.tmdbId === data.tmdbId);

        const progress =
          userData && data.numberOfEpisodes !== undefined
            ? {
                status: userData.status,
                value: getWatchProgress(userData.watchCount, data.numberOfEpisodes)
              }
            : undefined;

        return (
          <SeriesCard
            key={data.tmdbId}
            series={data}
            seriesId={userData?.seriesId}
            progress={progress}
          />
        );
      })}
    </div>
  );
}
