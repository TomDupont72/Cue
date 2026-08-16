import { Prisma, type UserEpisode, type UserSeries } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";
import {
  DashboardSummaryEpisodesRow,
  DashboardSummarySeriesRow,
  EpisodeFeedRow,
  UserSeriesProgressRow
} from "./user.types.js";
import { findManyPaginated } from "@/shared/utils/prisma/prisma.js";

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

  findLatestWatchedEpisode(userId: string, seriesId: number, db: PrismaTx = prisma) {
    return db.userEpisode.findFirst({
      where: {
        userId,
        episode: {
          seriesId
        }
      },
      orderBy: {
        watchedAt: "desc"
      }
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
    return db.userSeries.upsert({
      where,
      create: create,
      update: update
    });
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

  updateManySeries(
    where: Prisma.UserSeriesWhereInput,
    data: Prisma.UserSeriesUpdateManyMutationInput,
    db: PrismaTx = prisma
  ) {
    return db.userSeries.updateMany({
      where,
      data
    });
  },

  createManyEpisodes(data: Prisma.UserEpisodeCreateManyInput[], db: PrismaTx = prisma) {
    return db.userEpisode.createManyAndReturn({
      data,
      skipDuplicates: true
    });
  },

  deleteEpisodes(userId: string, episodeIds: number[], db: PrismaTx = prisma) {
    if (episodeIds.length === 0) {
      return Promise.resolve<UserEpisode[]>([]);
    }

    return db.$queryRaw<UserEpisode[]>(Prisma.sql`
      DELETE FROM "UserEpisode"
      WHERE "userId" = ${userId}
        AND "episodeId" IN (${Prisma.join(episodeIds)})
      RETURNING "userId", "episodeId", "watchedAt"
    `);
  },

  async getDashboardSummary(userId: string, db: PrismaTx = prisma) {
    const [summaryEpisodes] = await db.$queryRaw<DashboardSummaryEpisodesRow[]>`
        SELECT SUM(e.runtime) AS "totalWatchedMinutes", COUNT(e.id) AS "totalWatchedEpisodes" FROM "Episode" e
        INNER JOIN "UserEpisode" ue         
        ON ue."episodeId" = e.id
        WHERE ue."userId" = ${userId};
    `;

    const [summarySeries] = await db.$queryRaw<DashboardSummarySeriesRow[]>`
        SELECT COUNT(us."seriesId") AS "totalWatchedSeries" FROM "UserSeries" us
        WHERE us."userId"= ${userId}
        AND us.status = 'COMPLETED';
    `;

    return {
      totalWatchedMinutes: Number(summaryEpisodes.totalWatchedMinutes),
      totalWatchedEpisodes: Number(summaryEpisodes.totalWatchedEpisodes),
      totalWatchedSeries: Number(summarySeries.totalWatchedSeries)
    };
  },

  async getEpisodesFeed(userId: string, db: PrismaTx = prisma) {
    return db.$queryRaw<EpisodeFeedRow[]>`
        SELECT
        us."userId",
        us."seriesId",
        us.status,
        us."lastWatchedAt",

        s.name AS "seriesName",
        s."posterPath" AS "seriesPosterPath",
        s."tmdbId" AS "seriesTmdbId",

        next_episode.id AS id,
        next_episode.name AS name,
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
            e.id,
            e.name,
            e."seasonNumber",
            e."episodeNumber",
            e."airDate",
            e."stillPath",
            e.runtime,
            e.overview,
            (COUNT(*) OVER())::int AS "remainingEpisodes"
        FROM "Episode" e

        WHERE e."seriesId" = us."seriesId"
            AND e."seasonNumber" <> 0
            AND e."airDate" IS NOT NULL
            AND e."airDate" < date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
              + INTERVAL '1 day'
            AND NOT EXISTS (
            SELECT 1
            FROM "UserEpisode" ue
            WHERE ue."userId" = us."userId"
                AND ue."episodeId" = e.id
            )

        ORDER BY
            e."seasonNumber" ASC,
            e."episodeNumber" ASC

        LIMIT 1
        ) next_episode ON TRUE

        WHERE us."userId" = ${userId}
        AND us.status IN (
            'WATCHING',
            'PAUSED',
            'DROPPED'
        )

        ORDER BY
        us."lastWatchedAt" DESC NULLS LAST,
        s.name ASC
    `;
  },

  async getEpisodeFeedItem(userId: string, seriesId: number, db: PrismaTx = prisma) {
    const [episode] = await db.$queryRaw<EpisodeFeedRow[]>`
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
          e.id,
          e.name,
          e."seasonNumber",
          e."episodeNumber",
          e."airDate",
          e."stillPath",
          e.runtime,
          e.overview,
          (COUNT(*) OVER())::int AS "remainingEpisodes"
        FROM "Episode" e

        WHERE e."seriesId" = us."seriesId"
          AND e."seasonNumber" <> 0
          AND e."airDate" IS NOT NULL
          AND e."airDate" < date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
            + INTERVAL '1 day'
          AND NOT EXISTS (
            SELECT 1
            FROM "UserEpisode" ue
            WHERE ue."userId" = us."userId"
              AND ue."episodeId" = e.id
          )

        ORDER BY
          e."seasonNumber" ASC,
          e."episodeNumber" ASC

        LIMIT 1
      ) next_episode ON TRUE

      WHERE us."userId" = ${userId}
        AND us."seriesId" = ${seriesId}
        AND us.status IN ('WATCHING', 'PAUSED', 'DROPPED')
    `;

    return episode ?? null;
  }
};
