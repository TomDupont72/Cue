import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type UserDashboardSummaryWidgetProps = {
  totalWatchedMinutes: number;
  totalWatchedEpisodes: number;
};

export default function UserDashboardSummaryWidget({
  totalWatchedMinutes,
  totalWatchedEpisodes
}: UserDashboardSummaryWidgetProps) {
  const months = Math.floor(totalWatchedMinutes / 43_200);
  const days = Math.floor((totalWatchedMinutes % 43_200) / 1_440);
  const hours = Math.floor((totalWatchedMinutes % 1_440) / 60);
  const minutes = totalWatchedMinutes % 60;

  return (
    <ScrollArea className="w-full min-w-0">
      <div className="flex w-max min-w-full flex-row justify-start gap-6 md:justify-center">
        <Card className="w-[calc(100vw-4.5rem)] shrink-0 bg-background border sm:w-96">
          <CardContent>
            <h1 className="font-bold text-xl text-center">TEMPS DE VISIONNAGE</h1>
          </CardContent>
          <CardFooter className="flex flex-row justify-center gap-4 bg-background">
            <div className="flex flex-col items-center">
              <p>{months}</p>
              <h1 className="font-semibold">MOI{months > 1 ? "S" : ""}</h1>
            </div>
            <div className="flex flex-col items-center">
              <p>{days}</p>
              <h1 className="font-semibold">JOUR{days > 1 ? "S" : ""}</h1>
            </div>
            <div className="flex flex-col items-center">
              <p>{hours}</p>
              <h1 className="font-semibold">HEURE{hours > 1 ? "S" : ""}</h1>
            </div>
            <div className="flex flex-col items-center">
              <p>{minutes}</p>
              <h1 className="font-semibold">MINUTE{minutes > 1 ? "S" : ""}</h1>
            </div>
          </CardFooter>
        </Card>
        <Card className="w-[calc(100vw-4.5rem)] shrink-0 bg-background border sm:w-96">
          <CardContent>
            <h1 className="font-bold text-xl text-center">ÉPISODES VISIONNÉS</h1>
          </CardContent>
          <CardFooter className="flex flex-row justify-center items-center bg-background">
            <h1 className="font-bold text-xl">{totalWatchedEpisodes}</h1>
          </CardFooter>
        </Card>
      </div>
    </ScrollArea>
  );
}
