import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type SeriesLinkBadgeProps = {
  seriesId: number;
  name: string;
  className?: string;
};

export function SeriesLinkBadge({ seriesId, name, className }: SeriesLinkBadgeProps) {
  return (
    <Badge
      variant="outline"
      render={<Link to={`/series?id=${seriesId}`} />}
      className={cn(
        "h-6 max-w-full gap-0.5 rounded-full border-2 border-white bg-black px-2",
        "text-xs font-semibold text-white hover:bg-black hover:text-white",
        "dark:border-white dark:bg-black dark:hover:bg-black",
        className
      )}
    >
      <span className="min-w-0 truncate">{name}</span>
      <ChevronRight className="shrink-0" />
    </Badge>
  );
}
