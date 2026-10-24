import { useTranslation } from "react-i18next";
import { Pie, PieChart } from "recharts";

import type { UserSeriesGetResponse } from "@/features/user/types/user.types";

import GroupDropdownMenu from "@/components/layout/groupDropdownMenu";
import { Heading } from "@/components/layout/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from "@/components/ui/input-group";
import { useUserSeriesView } from "@/features/user/hooks/useUserSeriesView";
import {
  SERIES_DATA_METRICS,
  type SeriesDataMetric,
  type UserSeriesFiltersFor,
  type UserSeriesGroupBy
} from "@/features/user/types/userSeriesFacets.types";

type SeriesDataGroupBy = Exclude<UserSeriesGroupBy, "status">;

type UserSeriesDataPieChartProps = {
  series: UserSeriesGetResponse["series"];
  groupBy: SeriesDataGroupBy;
  filters: UserSeriesFiltersFor<SeriesDataGroupBy>;
  metric: SeriesDataMetric;
  limit: number;
  onGroupByChange: (groupBy: SeriesDataGroupBy) => void;
  onMetricChange: (metric: SeriesDataMetric) => void;
  onLimitChange: (limit: number) => void;
};

export default function UserSeriesDataPieChart({
  series,
  groupBy,
  filters,
  metric,
  limit,
  onGroupByChange,
  onMetricChange,
  onLimitChange
}: UserSeriesDataPieChartProps) {
  const { t } = useTranslation();

  const optionConfig = {
    [groupBy]: {
      limit,
      orderBy: metric
    }
  };
  const { categoryNames, metricNames, filterOptions } = useUserSeriesView({
    series,
    filters,
    optionConfig,
    metricKeys: SERIES_DATA_METRICS
  });

  const chartData = filterOptions[groupBy].map((data) => ({
    ...data,
    fill: `var(--color-${data.id})`
  }));

  const chartConfig = Object.fromEntries(
    chartData.map((data, index) => [
      data.id,
      {
        label: data.label,
        color: `oklch(${0.25 + 0.75 * (index / (chartData.length - 1))} 0 0)`
      }
    ])
  ) as ChartConfig;

  return (
    <Card className="h-full">
      <CardHeader className="flex w-full flex-col gap-4">
        <Heading full={false} className="uppercase">
          {t("user:stats.group_distribution")}
        </Heading>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-start gap-2">
          <GroupDropdownMenu
            categories={categoryNames}
            category={categoryNames[groupBy]}
            onCategoryChange={(value) => onGroupByChange(value as SeriesDataGroupBy)}
          />
          <GroupDropdownMenu
            categories={metricNames}
            category={metricNames[metric]}
            onCategoryChange={(value) => onMetricChange(value as SeriesDataMetric)}
          />
          <InputGroup className="h-9 w-22 p-2 bg-muted/70">
            <InputGroupAddon>
              <InputGroupText>{t("common:labels.top")}</InputGroupText>
            </InputGroupAddon>

            <InputGroupInput
              type="number"
              min={1}
              step={1}
              value={limit}
              className="w-12 flex-none text-center"
              onChange={(event) =>
                onLimitChange(
                  Number.isInteger(event.target.valueAsNumber) && event.target.valueAsNumber >= 1
                    ? event.target.valueAsNumber
                    : limit
                )
              }
            />
          </InputGroup>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 min-h-100"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey={metric} nameKey="id" />
            <ChartLegend content={<ChartLegendContent nameKey="id" className="flex flex-wrap" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
