import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import SummaryCard from "@/features/user/components/summaryCard";
import { STATS } from "@/features/user/constants/stats";
import { Heading } from "@/components/layout/heading";
import { Text } from "@/components/layout/text";

type UserDashboardSummaryWidgetProps = {
  totalWatchedMinutes: number;
  totalWatchedEpisodes: number;
  totalWatchedSeries: number;
};

export default function UserDashboardSummaryWidget({
  totalWatchedMinutes,
  totalWatchedEpisodes,
  totalWatchedSeries
}: UserDashboardSummaryWidgetProps) {
  const { t } = useTranslation();

  const months = Math.floor(totalWatchedMinutes / 43_200);
  const days = Math.floor((totalWatchedMinutes % 43_200) / 1_440);
  const hours = Math.floor((totalWatchedMinutes % 1_440) / 60);
  const minutes = totalWatchedMinutes % 60;

  const stats = {
    WATCH_TIME: {
      MONTH: { label: "month", value: months },
      DAY: { label: "day", value: days },
      HOUR: { label: "hour", value: hours },
      MINUTE: { label: "minute", value: minutes }
    },
    WATCHED_EPISODES: totalWatchedEpisodes,
    WATCHED_SERIES: totalWatchedSeries
  };

  return (
    <ScrollArea className="w-full min-w-0">
      <div className="flex w-max min-w-full flex-row justify-start gap-6 md:justify-center">
        {Object.entries(STATS).map(([key, stat]) => (
          <SummaryCard key={stat.type} title={t(`user:stats.${stat.label}`)}>
            {stat.type == "duration" ? (
              Object.values(stats[key as keyof typeof stats]).map((timePart) => (
                <div key={timePart.label} className="flex flex-col items-center">
                  <Text>{timePart.value}</Text>
                  <Heading level={4} className="uppercase">
                    {t(`user:stats.${timePart.label}`, { count: timePart.value })}
                  </Heading>
                </div>
              ))
            ) : (
              <Heading level={2} className="text-center">
                {stats[key as keyof typeof stats] as number}
              </Heading>
            )}
          </SummaryCard>
        ))}
      </div>
    </ScrollArea>
  );
}
