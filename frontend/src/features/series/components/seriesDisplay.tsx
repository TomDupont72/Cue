import { useNavigate } from "react-router-dom";
import type { SeriesSearchGetResult } from "../types/series.types";
import { SeriesCard } from "./seriesCard";

type SeriesDisplayProps = {
  seriesData: SeriesSearchGetResult[];
};

export default function SeriesDisplay({ seriesData }: SeriesDisplayProps) {
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
      {seriesData.map((series) => (
        <SeriesCard
          key={series.tmdbId}
          series={series}
          onClick={() => navigate(`/series?id=${series.tmdbId}`)}
        />
      ))}
    </div>
  );
}
