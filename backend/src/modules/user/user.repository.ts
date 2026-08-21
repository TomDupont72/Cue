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

function getEpisodesFeedQuery(userId: string, seriesId?: number) {
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
          AND remaining."airDate" <
            date_trunc(
              'day',
              CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
            ) + INTERVAL '1 day'

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
        AND next_e."airDate" <
          date_trunc(
            'day',
            CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
          ) + INTERVAL '1 day'

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
        SELECT COALESCE(SUM(e.runtime), 0)::bigint AS "totalWatchedMinutes", COUNT(e.id) AS "totalWatchedEpisodes" FROM "Episode" e
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
    return db.$queryRaw<EpisodeFeedRow[]>(getEpisodesFeedQuery(userId));
  },

  async getEpisodeFeedItem(userId: string, seriesId: number, db: PrismaTx = prisma) {
    const [episode] = await db.$queryRaw<EpisodeFeedRow[]>(getEpisodesFeedQuery(userId, seriesId));

    return episode ?? null;
  },

  async getEpisodesUpcoming(userId: string, db: PrismaTx = prisma) {
    return db.$queryRaw<EpisodeFeedRow[]>(Prisma.sql`
    SELECT
      t."seriesId",
      t."seriesName",
      t.id,
      t.name,
      t."episodeNumber",
      t."seasonNumber",
      t."airDate",
      t."stillPath",
      t.runtime,
      t.overview
    FROM (
      SELECT
        s.id AS "seriesId",
        s.name AS "seriesName",
        e.id,
        e.name,
        e."episodeNumber",
        e."seasonNumber",
        e."airDate",
        e."stillPath",
        e.runtime,
        e.overview,
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

      WHERE e."airDate" > CURRENT_DATE
        AND us."userId" = ${userId}
    ) t

    WHERE t.rn = 1
  `);
  }
};
