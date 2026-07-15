import { ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getTmdbImageUrl } from "@/lib/tmdbImage";
import type { SeriesSearchResult } from "../types/series.types";
import { getYear } from "@/lib/utils";

type SeriesCardProps = {
  series: SeriesSearchResult;
  onClick?: (series: SeriesSearchResult) => void;
};

export function SeriesCard({ series, onClick }: SeriesCardProps) {
  const posterUrl = getTmdbImageUrl(series.posterPath);
  const year = getYear(series.firstAirDate);

  return (
    <Card
      className="group cursor-pointer overflow-hidden p-0 transition-transform hover:-translate-y-1 hover:shadow-md"
      onClick={() => onClick?.(series)}
    >
      <div className=" aspect-[2/3] overflow-hidden bg-muted">
        {posterUrl ? (
          <img
            src={posterUrl}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
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
