import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";

type UserEpisodesActivity = {
  date: Date;
  watchedEpisodes: bigint;
  watchedMinutes: bigint;
};

export async function listUserEpisodesActivity(
  userId: string,
  timezone: string,
  seriesIds?: number[],
  db: PrismaTx = prisma
) {
  const activityRows = await db.$queryRaw<UserEpisodesActivity[]>(Prisma.sql`
        SELECT
            DATE_TRUNC('day', ue."watchedAt" AT TIME ZONE 'UTC', ${timezone}) AT TIME ZONE 'UTC' as date,
            COALESCE(COUNT(*), 0) as "watchedEpisodes",
            COALESCE(SUM(e.runtime), 0) as "watchedMinutes"
        FROM "UserEpisode" ue
        JOIN "Episode" e
        ON ue."episodeId" = e.id
        WHERE ue."userId" = ${userId}
        ${seriesIds ? Prisma.sql`AND e."seriesId" in (${Prisma.join(seriesIds)})` : Prisma.empty}
        GROUP BY date
        ORDER BY date
   `);

  return activityRows.map((activityRow) => ({
    ...activityRow,
    watchedEpisodes: Number(activityRow.watchedEpisodes),
    watchedMinutes: Number(activityRow.watchedMinutes)
  }));
}
