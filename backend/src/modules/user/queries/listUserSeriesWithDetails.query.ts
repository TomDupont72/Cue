import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";

export async function listUserSeriesWithDetails(
  userId: string,
  date: Date,
  seriesId?: number,
  db: PrismaTx = prisma
) {
  const seriesRows = await db.userSeries.findMany({
    include: {
      series: {
        include: {
          providers: {
            include: { provider: true },
            orderBy: { provider: { displayPriority: "asc" } }
          },
          genres: { include: { genre: true }, orderBy: { genre: { name: "asc" } } }
        }
      }
    },
    where: { userId, seriesId }
  });

  const timeRows = await db.$queryRaw<
    { seriesId: number; watchedMinutes: bigint; remainingReleasedMinutes: bigint }[]
  >(Prisma.sql`
        SELECT
            us."seriesId",
            COALESCE(SUM(e.runtime) FILTER (WHERE ue."episodeId" IS NOT NULL), 0) AS "watchedMinutes",
            COALESCE(SUM(e.runtime) FILTER (WHERE ue."episodeId" IS NULL AND e."airDate" <= ${date}), 0) AS "remainingReleasedMinutes"
        FROM "UserSeries" us
        LEFT JOIN "Episode" e
            ON e."seriesId" = us."seriesId"
        LEFT JOIN "UserEpisode" ue
            ON e.id = ue."episodeId"
            AND us."userId" = ue."userId"
        WHERE us."userId" = ${userId}
        ${seriesId ? Prisma.sql`AND us."seriesId" = ${seriesId}` : Prisma.empty}
        GROUP BY us."seriesId"
    `);

  const rows = seriesRows.map((seriesRow) => ({
    ...seriesRow,
    ...timeRows
      .map((timeRow) => ({
        ...timeRow,
        watchedMinutes: Number(timeRow.watchedMinutes),
        remainingReleasedMinutes: Number(timeRow.remainingReleasedMinutes)
      }))
      .find((timeRow) => timeRow.seriesId === seriesRow.seriesId)
  }));

  return rows.sort(
    (a, b) => (b.lastWatchedAt ?? b.addedAt).getTime() - (a.lastWatchedAt ?? a.addedAt).getTime()
  );
}
