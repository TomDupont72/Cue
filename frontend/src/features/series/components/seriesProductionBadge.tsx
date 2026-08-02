import { Badge } from "@/components/ui/badge";

type SeriesProductionBadgeProps = {
  inProduction: boolean;
};

export default function SeriesProductionBadge({ inProduction }: SeriesProductionBadgeProps) {
  const productionValue = inProduction
    ? {
        text: "En production",
        color:
          "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
      }
    : {
        text: "Achevée",
        color:
          "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
      };

  return <Badge className={productionValue.color}>{productionValue.text}</Badge>;
}
