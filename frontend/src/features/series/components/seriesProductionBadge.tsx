import { Badge } from "@/components/ui/badge";

type SeriesProductionBadgeProps = {
  inProduction: boolean;
};

export default function SeriesProductionBadge({ inProduction }: SeriesProductionBadgeProps) {
  const productionValue = inProduction
    ? {
        text: "En production",
        color:
          "border-coral-200 bg-coral-50 text-coral-700 dark:border-coral-800 dark:bg-coral-950 dark:text-coral-300"
      }
    : {
        text: "Achevée",
        color:
          "border-warm-gray-200 bg-warm-gray-50 text-warm-gray-700 dark:border-warm-gray-800 dark:bg-warm-gray-950 dark:text-warm-gray-300"
      };

  return <Badge className={productionValue.color}>{productionValue.text}</Badge>;
}
