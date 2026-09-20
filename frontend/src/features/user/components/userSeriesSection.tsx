import SeriesDisplay from "@/features/series/components/seriesDisplay";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/layout/heading";
import type { SeriesSectionItem } from "../types/user.types";

type UserSeriesSectionProps = {
  series: SeriesSectionItem[];
};

export function UserSeriesSection({ series }: UserSeriesSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-4">
      <Heading level={3} className="uppercase">
        {t(`user:series.status.${series[0].status}.section`)}
      </Heading>
      <div className="h-px w-full bg-border" />
      <SeriesDisplay series={series.map((item) => item.seriesDetails)} userSeries={series} />
    </section>
  );
}
