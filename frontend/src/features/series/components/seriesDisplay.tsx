import type { SeriesDisplaySeries } from "@/features/series/types/series.types";
import { SeriesCard } from "@/features/series/components/seriesCard";
import type { UserSeriesGetResponse } from "@/features/user/types/user.types";

type SeriesDisplayProps = {
  series: SeriesDisplaySeries[];
  userSeries?: UserSeriesGetResponse["items"];
  isProgress?: boolean;
};

export default function SeriesDisplay({
  series,
  userSeries = [],
  isProgress = false
}: SeriesDisplayProps) {
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

        const watchProgress = userData
          ? (userData.watchCount / data.numberOfEpisodes) * 100
          : undefined;

        return (
          <SeriesCard
            key={data.tmdbId}
            series={data}
            seriesId={userData?.seriesId}
            isProgress={isProgress}
            status={userData?.status}
            watchProgress={watchProgress}
          />
        );
      })}
    </div>
  );
}
