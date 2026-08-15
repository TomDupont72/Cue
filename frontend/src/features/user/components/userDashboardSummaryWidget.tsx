import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

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

  return (
    <ScrollArea className="w-full min-w-0">
      <div className="flex w-max min-w-full flex-row justify-start gap-6 md:justify-center">
        <Card className="w-[calc(100vw-4.5rem)] shrink-0 bg-background border sm:w-96">
          <CardContent>
            <h1 className="font-bold text-xl text-center">
              {t("user:stats.watchTime").toUpperCase()}
            </h1>
          </CardContent>
          <CardFooter className="flex flex-row justify-center gap-4 bg-background">
            <div className="flex flex-col items-center">
              <p>{months}</p>
              <h1 className="font-semibold">
                {t("user:stats.month", { count: months }).toUpperCase()}
              </h1>
            </div>
            <div className="flex flex-col items-center">
              <p>{days}</p>
              <h1 className="font-semibold">
                {t("user:stats.day", { count: days }).toUpperCase()}
              </h1>
            </div>
            <div className="flex flex-col items-center">
              <p>{hours}</p>
              <h1 className="font-semibold">
                {t("user:stats.hour", { count: hours }).toUpperCase()}
              </h1>
            </div>
            <div className="flex flex-col items-center">
              <p>{minutes}</p>
              <h1 className="font-semibold">
                {t("user:stats.minute", { count: minutes }).toUpperCase()}
              </h1>
            </div>
          </CardFooter>
        </Card>
        <Card className="w-[calc(100vw-4.5rem)] shrink-0 bg-background border sm:w-96">
          <CardContent>
            <h1 className="font-bold text-xl text-center">
              {t("user:stats.watchedEpisodes").toUpperCase()}
            </h1>
          </CardContent>
          <CardFooter className="flex flex-row justify-center items-center bg-background">
            <h1 className="font-bold text-xl">{totalWatchedEpisodes}</h1>
          </CardFooter>
        </Card>
        <Card className="w-[calc(100vw-4.5rem)] shrink-0 bg-background border sm:w-96">
          <CardContent>
            <h1 className="font-bold text-xl text-center">
              {t("user:stats.watchedSeries").toUpperCase()}
            </h1>
          </CardContent>
          <CardFooter className="flex flex-row justify-center items-center bg-background">
            <h1 className="font-bold text-xl">{totalWatchedSeries}</h1>
          </CardFooter>
        </Card>
      </div>
    </ScrollArea>
  );
}
