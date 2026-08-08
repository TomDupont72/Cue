import { useNavigate } from "react-router-dom";
import type { SeriesCardData } from "../types/series.types";
import { SeriesCard } from "./seriesCard";
import type { UserSeriesGetResponse } from "@/features/user/types/user.types";

type SeriesDisplayProps = {
  seriesData: SeriesCardData[];
  userSeriesData?: UserSeriesGetResponse["items"];
  isProgress?: boolean;
};

export default function SeriesDisplay({
  seriesData,
  userSeriesData = [],
  isProgress = false
}: SeriesDisplayProps) {
  const navigate = useNavigate();

  return (
    <div
      className="
                  grid grid-cols-2 gap-4
                  sm:grid-cols-3
                  md:grid-cols-4
                  lg:grid-cols-5
                "
    >
      {seriesData.map((series) => {
        const userSeries = userSeriesData.find(
          (item) => item.seriesDetails.tmdbId === series.tmdbId
        );

        const numberOfEpisodes = userSeries?.seriesDetails.numberOfEpisodes;
        const watchProgress =
          userSeries && numberOfEpisodes
            ? (userSeries.watchCount / numberOfEpisodes) * 100
            : undefined;

        return (
          <SeriesCard
            key={series.tmdbId}
            series={series}
            onClick={() => navigate(`/series?id=${series.tmdbId}`)}
            isProgress={isProgress}
            status={userSeries?.status}
            watchProgress={watchProgress}
          />
        );
      })}
    </div>
  );
}
