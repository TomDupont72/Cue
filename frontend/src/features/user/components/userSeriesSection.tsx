import type { SeriesSectionItem } from "@/features/user/types/user.types";

import { Heading } from "@/components/layout/heading";
import SeriesDisplay from "@/features/series/components/seriesDisplay";

type UserSeriesSectionProps = {
  series: SeriesSectionItem[];
  category: string;
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
