import { Prisma, type UserEpisode, type UserSeries } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";
import { EpisodeFeedRow, EpisodeUpcomingRow, UserSeriesProgressRow } from "./user.types.js";
import { findManyPaginated } from "@/shared/utils/prisma/prisma.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";
import { SelectQuery } from "@/shared/db/selectQuery.js";
import { AggregateQuery } from "@/shared/db/aggregateQuery.js";
import { userEpisodeTable, userSeriesTable } from "@/shared/db/constants/aggregateTables.js";
import { InsertQuery } from "@/shared/db/insertQuery.js";
import { UpdateQuery } from "@/shared/db/updateQuery.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";
import { DbNull } from "@prisma/client/runtime/client";
import { DeleteQuery } from "@/shared/db/deleteQuery.js";

export const userEpisodeSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery(db.userEpisode, "USER_EPISODE_NOT_FOUND");

export const userEpisodeAggregateQuery = (db: PrismaTx = prisma) =>
  new AggregateQuery(db.userEpisode, db, userEpisodeTable);

export const userEpisodeInsertQuery = (db: PrismaTx = prisma) => new InsertQuery(db.userEpisode);

export const userEpisodeDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.userEpisode, db, userEpisodeTable);

export const userSeriesSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery(db.userSeries, "USER_SERIES_NOT_FOUND");

export const userSeriesAggregateQuery = (db: PrismaTx = prisma) =>
  new AggregateQuery(db.userSeries, db, userSeriesTable);

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
  findOneSeries(where: Prisma.UserSeriesWhereUniqueInput, db: PrismaTx = prisma) {
    return db.userSeries.findUnique({
      where
    });
  },

  findOneEpisode(where: Prisma.UserEpisodeWhereUniqueInput, db: PrismaTx = prisma) {
    return db.userEpisode.findUnique({
      where
    });
  },

  findManySeries(
    where: Prisma.UserSeriesWhereInput,
    limit: number,
    cursor: Date | undefined,
    cursorField: "addedAt" | "lastWatchedAt",
    db: PrismaTx = prisma
  ) {
    return findManyPaginated({
      where,
      limit,
      cursor,
      cursorField,
      order: "desc",
      delegate: db.userSeries
    });
  },

  findManyEpisodes(where: Prisma.UserEpisodeWhereInput, db: PrismaTx = prisma) {
    return db.userEpisode.findMany({
      where
    });
  },

  getSeriesProgress(userId: string, db: PrismaTx = prisma) {
    return db.$queryRaw<UserSeriesProgressRow[]>(Prisma.sql`
      SELECT
        e."seriesId",
        COUNT(*)::int AS "watchedEpisodeCount",
        (COUNT(*) FILTER (WHERE e."seasonNumber" <> 0))::int AS "watchCount",
        MAX(ue."watchedAt") AS "lastWatchedAt"
      FROM "UserEpisode" ue
      JOIN "Episode" e ON e.id = ue."episodeId"
      WHERE ue."userId" = ${userId}
      GROUP BY e."seriesId"
    `);
  },

  upsertSeries(
    where: Prisma.UserSeriesWhereUniqueInput,
    create: Prisma.UserSeriesUncheckedCreateInput,
    update: Prisma.UserSeriesUncheckedUpdateInput,
    db: PrismaTx = prisma
  ) {
    return userSeriesUpsertQuery(db).where(where).create(create).update(update).first();
  },

  updateSeries(
    where: Prisma.UserSeriesWhereUniqueInput,
    data: Prisma.UserSeriesUncheckedUpdateInput,
    db: PrismaTx = prisma
  ) {
    return db.userSeries.update({
      where,
      data
    });
  },

  async incrementSeriesProgress(
    userId: string,
    seriesId: number,
    delta: number,
    watchedAt: Date,
    db: PrismaTx = prisma
  ) {
    const [userSeries] = await db.$queryRaw<UserSeries[]>(Prisma.sql`
      UPDATE "UserSeries"
      SET "watchCount" = "watchCount" + ${delta},
          "lastWatchedAt" = GREATEST(
            COALESCE("lastWatchedAt", ${watchedAt}),
            ${watchedAt}
          )
      WHERE "userId" = ${userId}
        AND "seriesId" = ${seriesId}
      RETURNING
        "userId",
        "seriesId",
        "status",
        "isFavorite",
        "watchCount",
        "addedAt",
        "lastWatchedAt"
    `);

    return userSeries ?? null;
  },

  async updateManySeries(
    where: Prisma.UserSeriesWhereInput,
    data: Prisma.UserSeriesUpdateManyMutationInput,
    db: PrismaTx = prisma
  ) {
    const count = await userSeriesUpdateQuery(db).where(where).set(data).execute();

    return { count };
  },

  createManyEpisodes(data: Prisma.UserEpisodeCreateManyInput[], db: PrismaTx = prisma) {
    return userEpisodeInsertQuery(db).values(data).skipDuplicates().all();
  },

  deleteEpisodes(userId: string, episodeIds: number[], db: PrismaTx = prisma) {
    if (episodeIds.length === 0) {
      return Promise.resolve<UserEpisode[]>([]);
    }

    return userEpisodeDeleteQuery(db)
      .where({ userId, episodeId: { in: episodeIds } })
      .all();
  },

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
  },

  async getEpisodesUpcoming(userId: string, now: Date, db: PrismaTx = prisma) {
    const currentDate = now.toISOString().slice(0, 10);

    return db.$queryRaw<EpisodeUpcomingRow[]>(Prisma.sql`
    SELECT
      t.id,
      t."seriesId",
      t."seasonId",
      t."airDate",
      t."episodeNumber",
      t.name,
      t.overview,
      t."tmdbId",
      t."stillPath",
      t."seasonNumber",
      t."voteAverage",
      t."createdAt",
      t."updatedAt",
      t.runtime,
      t."seriesName",
      t."seriesBackdropPath"
    FROM (
      SELECT
        s.name AS "seriesName",
        s."backdropPath" AS "seriesBackdropPath",
        e.*,
        ROW_NUMBER() OVER (
          PARTITION BY e."seriesId"
          ORDER BY
            e."airDate",
            e."seasonNumber",
            e."episodeNumber"
        ) AS rn

      FROM "Episode" e

      JOIN "Series" s
        ON e."seriesId" = s.id

      JOIN "UserSeries" us
        ON s.id = us."seriesId"

      WHERE e."airDate" > ${currentDate}::date
        AND us."userId" = ${userId}
    ) t

    WHERE t.rn = 1
    ORDER BY
        t."airDate" ASC,
        t."seriesName" ASC;
  `);
  }
};
