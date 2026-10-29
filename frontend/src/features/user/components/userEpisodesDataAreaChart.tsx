import { useTranslation } from "react-i18next";
import { Area, AreaChart, XAxis } from "recharts";

import type { UserEpisodesActivityGetResponse, UserSeriesGetResponse } from "@/features/user/types/user.types"

import { Heading } from "@/components/layout/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { displayDate } from "../utils/dates";
import GroupDropdownMenu from "@/components/layout/groupDropdownMenu";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue } from "@/components/ui/combobox";
import React from "react";

type Metric = "watchedEpisodes" | "watchedMinutes"

type UserEpisodesDataAreaChartProps = {
    series: UserSeriesGetResponse["series"],
    episodesActivity: UserEpisodesActivityGetResponse["activity"],
    metric: Metric,
    onMetricChange: (metric: Metric) => void 
}

export default function UserEpisodesDataAreaChart({ series, episodesActivity, metric, onMetricChange }: UserEpisodesDataAreaChartProps) {
    const { t } = useTranslation()

    const chartData = [episodesActivity[0]]

    for (let i = 1; i < episodesActivity.length; i++) {
        chartData.push({date: episodesActivity[i].date, watchedEpisodes: episodesActivity[i].watchedEpisodes + chartData[i-1].watchedEpisodes, watchedMinutes: episodesActivity[i].watchedMinutes + chartData[i-1].watchedMinutes})
    }

    const seriesNames = series.map((serie) => serie.seriesDetails.name)

    const metricNames = {"watchedEpisodes": "Total", "watchedMinutes": "Temps de visionnage"}

    const chartConfig = {
        watchedEpisodes: {
            label: "Total",
            color: "var(--chart-1)"
        }
    }
    
    return (
    <Card className="h-full">
      <CardHeader className="flex w-full flex-col gap-4">
        <Heading full={false} className="uppercase">
          {t("user:stats.status_distribution")}
        </Heading>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-start gap-2">
            <GroupDropdownMenu categories={metricNames} category={metricNames[metric]} onCategoryChange={(value) => onMetricChange(value as Metric)}/>
            <Combobox<UserSeriesGetResponse["series"][number], true> multiple autoHighlight items={series} itemToStringLabel={(item) => item.seriesDetails.name} isItemEqualToValue={(item, value) => item.seriesId === value.seriesId} onValueChange={(values) => console.log(values)}>
                <ComboboxChips>
                <ComboboxValue>
                    {(values) => (
                        <React.Fragment>
                            {values.map((value: UserSeriesGetResponse["series"][number]) => (
                                <ComboboxChip key={value.seriesId}>{value.seriesDetails.name}</ComboboxChip>
                            )) }
                            <ComboboxChipsInput />
                        </React.Fragment>
                    )}
                </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item.seriesId} value={item}>
                            {item.seriesDetails.name}
                        </ComboboxItem>
                    )}
                </ComboboxList>
                </ComboboxContent>
            </Combobox>
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
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
          </defs>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent nameKey="id" className="flex flex-wrap" />} />
            <XAxis dataKey="date" minTickGap={100} tickFormatter={(date) => displayDate(date, "fr-FR", "daily")}/>
            <Area dataKey={metric}  legendType="none" type="natural" fill="url(#fillArea)" stroke="var(--color-watchedEpisodes)"/>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
    )
}