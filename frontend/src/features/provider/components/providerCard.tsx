import { Card, CardContent } from "@/components/ui/card";
import type { ProviderRow } from "../types/provider.types";
import Picture from "@/components/layout/picture";
import { Text } from "@/components/layout/text";

type ProviderCardProps = {
  seriesProvider: ProviderRow;
};

export function ProviderCard({ seriesProvider }: ProviderCardProps) {
  return (
    <Card className="flex h-20 w-48 flex-row gap-0 items-center overflow-hidden border border-border bg-muted/50 p-0">
      <div className="size-20 shrink-0 overflow-hidden rounded-xl">
        <Picture path={seriesProvider.logoPath} size="w500" />
      </div>

      <CardContent className="flex flex-1 items-center justify-center text-center">
        <Text className="line-clamp-3 font-semibold">{seriesProvider.name}</Text>
      </CardContent>
    </Card>
  );
}
