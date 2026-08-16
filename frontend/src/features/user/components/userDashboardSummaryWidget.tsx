import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import SummaryCard from "@/features/user/components/summaryCard";
import { STATS } from "@/features/user/constants/stats";
import { Heading } from "@/components/layout/heading";
import { Text } from "@/components/layout/text";
import { splitWatchedDuration } from "../utils/watchDuration";

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

  const [months, days, hours, minutes] = splitWatchedDuration(totalWatchedMinutes);

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
          <SummaryCard key={stat.label} title={t(`user:stats.${stat.label}`)}>
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
