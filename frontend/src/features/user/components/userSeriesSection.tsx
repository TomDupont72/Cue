import SeriesDisplay from "@/features/series/components/seriesDisplay";
import { Heading } from "@/components/layout/heading";
import type { SeriesSectionItem } from "../types/user.types";

type UserSeriesSectionProps = {
  series: SeriesSectionItem[];
  category: string,
};

export function UserSeriesSection({ series, category }: UserSeriesSectionProps) {
  if (series.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <Heading level={3} className="uppercase">
        {category}
      </Heading>
      <div className="h-px w-full bg-border" />
      <SeriesDisplay series={series.map((item) => item.seriesDetails)} userSeries={series} />
    </section>
  );
}
