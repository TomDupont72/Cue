import { Badge } from "../ui/badge";

type StatusBadgeProps = {
  status: "PLANNED" | "WATCHING" | "COMPLETED" | "DROPPED" | "PAUSED";
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "COMPLETED") {
    return (
      <Badge className="bg-green-50 text-green-700 dark:bg-green-950 border-green-200 dark:text-green-300">
        Terminée
      </Badge>
    );
  }

  if (status === "PLANNED") {
    return (
      <Badge className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 border-yellow-200 dark:text-yellow-300">
        Pas commencée
      </Badge>
    );
  }

  if (status === "WATCHING") {
    return (
      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 border-blue-200 dark:text-blue-300">
        En cours
      </Badge>
    );
  }

  if (status === "DROPPED") {
    return (
      <Badge className="bg-red-50 text-red-700 dark:bg-red-950 border-red-200 dark:text-red-300">
        Arrêtée
      </Badge>
    );
  }

  if (status === "PAUSED") {
    return (
      <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 border-purple-200 dark:text-purple-300">
        En pause
      </Badge>
    );
  }
}
