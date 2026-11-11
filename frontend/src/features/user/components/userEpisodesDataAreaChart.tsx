import { useTranslation } from "react-i18next";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

import type { UserEpisodesActivityPeriod } from "@/features/user/constants/userEpisodesActivity";
import type {
  UserEpisodesActivityGetResponse,
  UserSeriesGetResponse
} from "@/features/user/types/user.types";

import GroupDropdownMenu from "@/components/layout/groupDropdownMenu";
import { GroupDropdownMultiMenu } from "@/components/layout/groupDropdownMultiMenu";
import { Heading } from "@/components/layout/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { USER_EPISODES_ACTIVITY_PERIODS } from "@/features/user/constants/userEpisodesActivity";
import { displayDate, durationToString, getTimeAxis } from "@/features/user/utils/dates";
import { getYear } from "@/lib/utils";

type Metric = "watchedEpisodes" | "watchedMinutes";

type UserEpisodesDataAreaChartProps = {
  series: UserSeriesGetResponse["series"];
  episodesActivity: UserEpisodesActivityGetResponse["activity"];
  metric: Metric;
  period: UserEpisodesActivityPeriod;
  seriesIds: number[];
  onMetricChange: (metric: Metric) => void;
  onPeriodChange: (period: UserEpisodesActivityPeriod) => void;
  onSeriesIdsChange: (seriesIds: number[]) => void;
};

export default function UserEpisodesDataAreaChart({
  series,
  episodesActivity,
  metric,
  period,
  seriesIds,
  onMetricChange,
  onPeriodChange,
  onSeriesIdsChange
}: UserEpisodesDataAreaChartProps) {
  const { t } = useTranslation();

  const activity = episodesActivity.map((item) => ({
    ...item,
    timestamp: new Date(item.date).getTime()
  }));

  const cumulativeActivity = activity.reduce<
    Array<{ timestamp: number; watchedEpisodes: number; watchedMinutes: number }>
  >((data, item) => {
    const previous = data.at(-1);

    data.push({
      timestamp: item.timestamp,
      watchedEpisodes: item.watchedEpisodes + (previous?.watchedEpisodes ?? 0),
      watchedMinutes: item.watchedMinutes + (previous?.watchedMinutes ?? 0)
    });

    return data;
  }, []);
  const maxActivityTimestamp =
    cumulativeActivity.length === 0
      ? undefined
      : Math.max(...cumulativeActivity.map((item) => item.timestamp));
  const thresholdActivityTimestamp =
    period === "all" || maxActivityTimestamp === undefined
      ? undefined
      : maxActivityTimestamp - USER_EPISODES_ACTIVITY_PERIODS[period];
  const chartData =
    thresholdActivityTimestamp === undefined
      ? cumulativeActivity
      : cumulativeActivity.filter((value) => value.timestamp >= thresholdActivityTimestamp);
  const chartMetricValues = chartData.map((item) => item[metric]);
  const chartMetricMin = Math.min(...chartMetricValues);
  const chartMetricMax = Math.max(...chartMetricValues);
  const chartMetricPadding = Math.max((chartMetricMax - chartMetricMin) * 0.1, 1);
  const yDomain: [number, number] =
    chartMetricValues.length === 0
      ? [0, 1]
      : [Math.max(0, chartMetricMin - chartMetricPadding), chartMetricMax + chartMetricPadding];

  const timeAxis = getTimeAxis(chartData.map((item) => item.timestamp));

  const metricNames: Record<Metric, string> = {
    watchedEpisodes: t("user:stats.activity.metrics.total"),
    watchedMinutes: t("user:stats.activity.metrics.watchTime")
  };
  const periodNames: Record<UserEpisodesActivityPeriod, string> = {
    all: t("user:stats.activity.period.all"),
    month: t("user:stats.activity.period.month"),
    months3: t("user:stats.activity.period.months3"),
    months6: t("user:stats.activity.period.months6"),
    year: t("user:stats.activity.period.year"),
    years2: t("user:stats.activity.period.years2"),
    years5: t("user:stats.activity.period.years5")
  };
  const sortedSeries = series
    .filter((serie) => serie.watchCount > 0)
    .sort((first, second) => first.seriesDetails.name.localeCompare(second.seriesDetails.name));
  const selectedSeries = series.filter((item) => seriesIds.includes(item.seriesId));

  const chartConfig = {
    watchedEpisodes: {
      label: metricNames.watchedEpisodes,
      color: "var(--chart-1)"
    },
    watchedMinutes: {
      label: metricNames.watchedMinutes,
      color: "var(--chart-1)"
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex w-full flex-col gap-4">
        <Heading full={false} className="uppercase">
          {t("user:stats.activity.title")}
        </Heading>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-start gap-2">
          <GroupDropdownMenu
            categories={metricNames}
            category={metricNames[metric]}
            onCategoryChange={(value) => onMetricChange(value as Metric)}
          />
          <GroupDropdownMenu
            categories={periodNames}
            category={periodNames[period]}
            onCategoryChange={(value) => onPeriodChange(value as UserEpisodesActivityPeriod)}
            prefix={t("user:stats.activity.period.prefix")}
          />
          <GroupDropdownMultiMenu
            items={sortedSeries}
            value={selectedSeries}
            itemToStringLabel={(item) => {
              const name = item.seriesDetails.name;
              const firstYear = getYear(item.seriesDetails.firstAirDate);

              return firstYear ? [name, `(${firstYear})`].join(" ") : name;
            }}
            itemToKey={(item) => item.seriesId}
            isItemEqualToValue={(item, value) => item.seriesId === value.seriesId}
            onValueChange={(values) => onSeriesIdsChange(values.map((item) => item.seriesId))}
            allLabel={t("user:stats.activity.series.all")}
            searchPlaceholder={t("user:stats.activity.series.search")}
            emptyLabel={t("user:stats.activity.series.empty")}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1">
        <ChartContainer
          config={chartConfig}
          className="flex-1 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 min-h-100"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  valueFormatter={
                    metric === "watchedMinutes"
                      ? (value) => durationToString(Number(value))
                      : undefined
                  }
                  labelFormatter={(_, payload) => {
                    const timestamp = payload[0]?.payload?.timestamp;

                    return typeof timestamp === "number"
                      ? displayDate(timestamp, "fr-FR", "daily")
                      : "";
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent nameKey="id" className="flex flex-wrap" />} />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              ticks={timeAxis.ticks}
              interval={0}
              tickFormatter={(timestamp) => displayDate(timestamp, "fr-FR", timeAxis.format)}
            />
            <YAxis hide domain={yDomain} />
            <Area
              dataKey={metric}
              legendType="none"
              type="linear"
              fill="url(#fillArea)"
              stroke="var(--color-watchedEpisodes)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
