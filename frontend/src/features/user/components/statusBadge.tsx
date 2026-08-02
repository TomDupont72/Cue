import type { UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: UserSeriesStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusValues = {
    COMPLETED: { text: "Terminée", color: "green" },
    PLANNED: { text: "Pas commencée", color: "yellow" },
    WATCHING: { text: "En cours", color: "blue" },
    DROPPED: { text: "Arrêtée", color: "red" },
    PAUSED: { text: "En pause", color: "purple" }
  };

  return (
    <Badge
      className={`bg-${statusValues[status].color}-50 text-${statusValues[status].color}-700 dark:bg-${statusValues[status].color}-950 border-${statusValues[status].color}-200 dark:text-${statusValues[status].color}-300`}
    >
      {statusValues[status].text}
    </Badge>
  );
}
