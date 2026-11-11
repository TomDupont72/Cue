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
    WITH activity AS (
        SELECT
        DATE_TRUNC('day', ue."watchedAt" AT TIME ZONE 'UTC', ${timezone})
            AT TIME ZONE 'UTC' AS date,
        COUNT(*) AS "watchedEpisodes",
        COALESCE(SUM(e.runtime), 0) AS "watchedMinutes"
        FROM "UserEpisode" ue
        JOIN "Episode" e ON ue."episodeId" = e.id
        WHERE ue."userId" = ${userId}
        ${seriesIds ? Prisma.sql`AND e."seriesId" IN (${Prisma.join(seriesIds)})` : Prisma.empty}
        GROUP BY 1
    )
    SELECT * FROM activity

    UNION ALL

    SELECT
        MIN(date) - INTERVAL '1 day' AS date,
        0 AS "watchedEpisodes",
        0 AS "watchedMinutes"
    FROM activity
    HAVING COUNT(*) > 0

    ORDER BY date
    `);

  return activityRows.map((activityRow) => ({
    ...activityRow,
    watchedEpisodes: Number(activityRow.watchedEpisodes),
    watchedMinutes: Number(activityRow.watchedMinutes)
  }));
}
