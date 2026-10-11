import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";

type UserSeriesProgress = {
  seriesId: number;
  watchedEpisodeCount: number;
  watchCount: number;
  lastWatchedAt: Date | null;
};

export async function getUserSeriesReconciliation(userId: string, db: PrismaTx = prisma) {
  const seriesProgress = await db.$queryRaw<UserSeriesProgress[]>(Prisma.sql`
    SELECT
      e."seriesId" AS "seriesId",
      COUNT(*)::integer AS "watchedEpisodeCount",
      (COUNT(*) FILTER (WHERE e."seasonNumber" <> 0))::integer AS "watchCount",
      MAX(ue."watchedAt") AS "lastWatchedAt"
    FROM "UserEpisode" ue
    INNER JOIN "Episode" e ON e.id = ue."episodeId"
    WHERE ue."userId" = ${userId}
    GROUP BY e."seriesId"
  `);

  const userSeries = await db.userSeries.findMany({
    where: { userId },
    include: { series: true }
  });

  return { seriesProgress, userSeries };
}
