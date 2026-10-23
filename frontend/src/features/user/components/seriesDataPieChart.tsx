import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import type { UserSeriesGetResponse } from "../types/user.types";
import { useUserSeriesView } from "../hooks/useUserSeriesView";

type SeriesDataPieChartProps = {
    series: UserSeriesGetResponse["series"]
}

export default function SeriesDataPieChart({series}: SeriesDataPieChartProps) {

    const { categoryNames, filterOptions, } = useUserSeriesView({
        series,
        filters: {status: {mode: "all", limit: 3}, genre: {mode: "all"}, provider: {mode: "all"}},
        groupBy: "genre"
    })

    const chartData = filterOptions.status.map((data) => ({...data, fill: `var(--color-${data.value})`}))
    const chartConfig = Object.fromEntries(chartData.map((data, index) => [data.value, {label: data.label, color: `hsl(0, 0%, ${25 + (index * 60) / Math.max(chartData.length - 1, 1)}%)`}])) as ChartConfig

    console.log(chartData, chartConfig)

    return (
        <Card>
        <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig}>
            <PieChart>
                            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
                <Pie data={chartData} dataKey="count" nameKey="value"
                />
                <ChartLegend
              content={<ChartLegendContent nameKey="value" />}
            />
            </PieChart>
        </ChartContainer>
        </CardContent>
        </Card>
    )
}