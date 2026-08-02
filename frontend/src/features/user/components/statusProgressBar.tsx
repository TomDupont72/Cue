import type { UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";
import { Progress } from "@/components/ui/progress";

type StatusProgressBarProps = {
  value: number;
  status: UserSeriesStatus;
};

export default function StatusProgressBar({ value, status }: StatusProgressBarProps) {
  const statusColors: Record<UserSeriesStatus, { track: string; indicator: string }> = {
    COMPLETED: { track: "bg-green-200", indicator: "bg-green-500" },
    PLANNED: { track: "bg-yellow-200", indicator: "bg-yellow-500" },
    WATCHING: { track: "bg-blue-200", indicator: "bg-blue-500" },
    DROPPED: { track: "bg-red-200", indicator: "bg-red-500" },
    PAUSED: { track: "bg-purple-200", indicator: "bg-purple-500" }
  };

  return (
    <Progress
      value={value}
      className="h-1"
      trackClassName={`h-1 rounded-none ${statusColors[status].track}`}
      indicatorClassName={statusColors[status].indicator}
    />
  );
}
