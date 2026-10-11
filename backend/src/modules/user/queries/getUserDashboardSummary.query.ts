import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";

export async function getUserDashboardSummary(userId: string, db: PrismaTx = prisma) {
  const episodesSummary = await db.episode.aggregate({
    where: { users: { some: { userId } } },
    _count: true,
    _sum: { runtime: true }
  });
  const seriesSummary = await db.userSeries.aggregate({
    where: { userId, status: "COMPLETED" },
    _count: true
  });

  return { episodesSummary, seriesSummary };
}
