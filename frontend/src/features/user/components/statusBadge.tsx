import type { UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: UserSeriesStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusValues = {
    COMPLETED: {
      text: "Terminée",
      color: "bg-green-50 text-green-700 dark:bg-green-950 border-green-200 dark:text-green-300"
    },
    PLANNED: {
      text: "Pas commencée",
      color:
        "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 border-yellow-200 dark:text-yellow-300"
    },
    WATCHING: {
      text: "En cours",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-950 border-blue-200 dark:text-blue-300"
    },
    DROPPED: {
      text: "Arrêtée",
      color: "bg-red-50 text-red-700 dark:bg-red-950 border-red-200 dark:text-red-300"
    },
    PAUSED: {
      text: "En pause",
      color:
        "bg-purple-50 text-purple-700 dark:bg-purple-950 border-purple-200 dark:text-purple-300"
    }
  };

  return <Badge className={statusValues[status].color}>{statusValues[status].text}</Badge>;
}
