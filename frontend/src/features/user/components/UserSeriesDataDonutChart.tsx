import { useTranslation } from "react-i18next";
import { Pie, PieChart } from "recharts";

import type { UserSeriesGetResponse } from "@/features/user/types/user.types";

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
import { USER_SERIES_STATUS_CHART_COLOR } from "@/features/user/constants/userSeriesStatus";
import { useUserSeriesView } from "@/features/user/hooks/useUserSeriesView";
import { SERIES_DATA_METRICS } from "@/features/user/types/userSeriesFacets.types";

type UserSeriesDataDonutChartProps = {
  series: UserSeriesGetResponse["series"];
};

export default function UserSeriesDataDonutChart({ series }: UserSeriesDataDonutChartProps) {
  const { t } = useTranslation();

  const { filterOptions } = useUserSeriesView({
    series,
    filters: { status: { mode: "all" } },
    metricKeys: SERIES_DATA_METRICS
  });

  const chartData = filterOptions.status.map((data) => ({
    ...data,
    fill: `var(--color-${data.id})`
  }));

  const chartConfig = Object.fromEntries(
    chartData.map((data) => [
      data.id,
      {
        label: data.label,
        color:
          USER_SERIES_STATUS_CHART_COLOR[data.id as keyof typeof USER_SERIES_STATUS_CHART_COLOR]
      }
    ])
  ) as ChartConfig;

  return (
    <Card className="h-full">
      <CardHeader className="flex w-full flex-col gap-4">
        <Heading full={false} className="uppercase">
          {t("user:stats.status_distribution")}
        </Heading>
      </CardHeader>
      <CardContent className="flex flex-1">
        <ChartContainer
          config={chartConfig}
          className="flex-1 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 min-h-100"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" nameKey="id" innerRadius="40%" />
            <ChartLegend content={<ChartLegendContent nameKey="id" className="flex flex-wrap" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
