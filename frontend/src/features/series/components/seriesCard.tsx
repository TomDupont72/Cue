import { ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getTmdbImageUrl } from "@/lib/tmdbImage";
import type { SeriesCardSeries } from "@/features/series/types/series.types";
import { getYear } from "@/lib/utils";
import StatusProgressBar from "@/features/user/components/statusProgressBar";
import type { UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";
import { useNavigate } from "react-router-dom";

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
  const posterUrl = getTmdbImageUrl(series.posterPath);
  const year = getYear(series.firstAirDate);

  const navigate = useNavigate();

  const handleClick = () => {
    if (seriesId) {
      navigate(`/series?id=${seriesId}`);
    } else {
      navigate("/series", {
        state: {
          tmdbId: series.tmdbId
        }
      });
    }
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden p-0 transition-transform hover:-translate-y-1 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="overflow-hidden rounded-xl bg-muted">
        <div className="aspect-[2/3]">
          {posterUrl ? (
            <img
              src={posterUrl}
              loading="lazy"
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" />
            </div>
          )}
        </div>

        {isProgress ? (
          <StatusProgressBar value={watchProgress ?? 0} status={status ?? "PLANNED"} />
        ) : null}
      </div>

      <CardContent className="flex flex-col gap-1 p-3">
        <h2 className="truncate font-medium">{series.name}</h2>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {year ? <span>{year}</span> : <span>Date inconnue</span>}
        </div>
      </CardContent>
    </Card>
  );
}
