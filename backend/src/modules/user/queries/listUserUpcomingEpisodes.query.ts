import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";
import { UserUpcomingEpisodeRow } from "../user.types.js";

export async function listUserUpcomingEpisodes(userId: string, date: Date, db: PrismaTx = prisma) {
  return db.$queryRaw<UserUpcomingEpisodeRow[]>(Prisma.sql`
  SELECT next_episode.*
  FROM (
    SELECT DISTINCT ON (e."seriesId")
      e.*,
      s.name AS "seriesName",
      s."backdropPath" AS "seriesBackdropPath"
    FROM "Episode" e
    INNER JOIN "Series" s
      ON s.id = e."seriesId"
    INNER JOIN "UserSeries" us
      ON us."seriesId" = e."seriesId"
    WHERE us."userId" = ${userId}
      AND e."airDate" > ${date}
    ORDER BY
      e."seriesId",
      e."airDate",
      e."seasonNumber",
      e."episodeNumber",
      e.id
  ) next_episode
  ORDER BY
    next_episode."airDate",
    next_episode."seriesName"
`);
}
