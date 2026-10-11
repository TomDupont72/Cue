import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";

export async function listEpisodeCounts(
  seriesIds: number[],
  releaseCutoff: Date,
  db: PrismaTx = prisma
) {
  return db.episode.groupBy({
    by: ["seriesId"],
    where: {
      seriesId: { in: seriesIds },
      seasonNumber: { not: 0 },
      airDate: { lt: releaseCutoff }
    },
    _count: true
  });
}
