import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";
import { EpisodeFeedRow } from "./user.types.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";
import { SelectQuery } from "@/shared/db/selectQuery.js";
import { RelationalSelectQuery } from "@/shared/db/relationalSelectQuery.js";
import { userEpisodeTable, userSeriesTable } from "@/shared/db/constants/queryTables.js";
import { InsertQuery } from "@/shared/db/insertQuery.js";
import { UpdateQuery } from "@/shared/db/updateQuery.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";
import { DeleteQuery } from "@/shared/db/deleteQuery.js";

export const userEpisodeSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery(db.userEpisode, "USER_EPISODE_NOT_FOUND");

export const userEpisodeRelationalSelectQuery = (db: PrismaTx = prisma) =>
  new RelationalSelectQuery(db.userEpisode, db, userEpisodeTable);

export const userEpisodeInsertQuery = (db: PrismaTx = prisma) => new InsertQuery(db.userEpisode);

export const userEpisodeDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.userEpisode, db, userEpisodeTable);

export const userSeriesSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery(db.userSeries, "USER_SERIES_NOT_FOUND");

export const userSeriesRelationalSelectQuery = (db: PrismaTx = prisma) =>
  new RelationalSelectQuery(db.userSeries, db, userSeriesTable);

export const userSeriesUpdateQuery = (db: PrismaTx = prisma) => new UpdateQuery(db.userSeries);

export const userSeriesUpsertQuery = (db: PrismaTx = prisma) => new UpsertQuery(db.userSeries);

function getEpisodesFeedQuery(userId: string, releaseCutoff: Date, seriesId?: number) {
  const seriesFilter =
    seriesId === undefined ? Prisma.empty : Prisma.sql`AND us."seriesId" = ${seriesId}`;

  return Prisma.sql`
  SELECT
    us."userId",
    us."seriesId",
    us.status,
    us."lastWatchedAt",

    s.name AS "seriesName",
    s."posterPath" AS "seriesPosterPath",
    s."tmdbId" AS "seriesTmdbId",

    next_episode.id,
    next_episode.name,
    next_episode."seasonNumber",
    next_episode."episodeNumber",
    next_episode."airDate",
    next_episode."stillPath",
    next_episode.runtime,
    next_episode."remainingEpisodes",
    next_episode.overview

  FROM "UserSeries" us

  JOIN "Series" s
    ON s.id = us."seriesId"

  JOIN LATERAL (
    SELECT
      candidate.id,
      candidate.name,
      candidate."seasonNumber",
      candidate."episodeNumber",
      candidate."airDate",
      candidate."stillPath",
      COALESCE(candidate.runtime, 0) AS runtime,
      candidate.overview,

      (
        SELECT COUNT(*)::int
        FROM "Episode" remaining

        WHERE remaining."seriesId" = us."seriesId"

          AND remaining."seasonNumber" IS NOT NULL
          AND remaining."episodeNumber" IS NOT NULL
          AND remaining."seasonNumber" <> 0

          AND remaining."airDate" IS NOT NULL
          AND remaining."airDate" < ${releaseCutoff}

          AND NOT EXISTS (
            SELECT 1
            FROM "UserEpisode" seen_remaining
            WHERE seen_remaining."userId" = us."userId"
              AND seen_remaining."episodeId" = remaining.id
          )
      ) AS "remainingEpisodes"

    FROM "UserEpisode" watched

    JOIN "Episode" current_episode
      ON current_episode.id = watched."episodeId"

    /*
     * Pour chaque épisode regardé,
     * on récupère son épisode suivant IMMÉDIAT.
     */
    JOIN LATERAL (
      SELECT next_e.*

      FROM "Episode" next_e

      WHERE next_e."seriesId" = current_episode."seriesId"

        AND next_e."seasonNumber" IS NOT NULL
        AND next_e."episodeNumber" IS NOT NULL
        AND next_e."seasonNumber" <> 0

        AND next_e."airDate" IS NOT NULL
        AND next_e."airDate" < ${releaseCutoff}

        AND (
          next_e."seasonNumber",
          next_e."episodeNumber"
        ) > (
          current_episode."seasonNumber",
          current_episode."episodeNumber"
        )

      ORDER BY
        next_e."seasonNumber" ASC,
        next_e."episodeNumber" ASC

      LIMIT 1

    ) candidate ON TRUE

    WHERE watched."userId" = us."userId"

      AND current_episode."seriesId" = us."seriesId"

      AND NOT EXISTS (
        SELECT 1

        FROM "UserEpisode" seen

        WHERE seen."userId" = us."userId"
          AND seen."episodeId" = candidate.id
      )

    ORDER BY
      watched."watchedAt" DESC NULLS LAST,
      current_episode.id DESC

    LIMIT 1

  ) next_episode ON TRUE

  WHERE us."userId" = ${userId}
    ${seriesFilter}
    AND us.status IN (
      'WATCHING',
      'PAUSED',
      'DROPPED'
    )

  ORDER BY
    us."lastWatchedAt" DESC NULLS LAST,
    s.name ASC
`;
}

export const userRepository = {
  async getEpisodesFeed(userId: string, db: PrismaTx = prisma) {
    return db.$queryRaw<EpisodeFeedRow[]>(getEpisodesFeedQuery(userId, getEpisodeReleaseCutoff()));
  },

  async getEpisodeFeedItem(
    userId: string,
    seriesId: number,
    db: PrismaTx = prisma,
    releaseCutoff = getEpisodeReleaseCutoff()
  ) {
    const [episode] = await db.$queryRaw<EpisodeFeedRow[]>(
      getEpisodesFeedQuery(userId, releaseCutoff, seriesId)
    );

    return episode ?? null;
  }
};
