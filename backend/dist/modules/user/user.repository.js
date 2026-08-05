import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../shared/db/prisma.js";
import { deleteManyAndFetch, findManyPaginated, upsertManyAndFetch } from "../../shared/utils/prisma/prisma.js";
export const userRepository = {
    findOneSeries(where, db = prisma) {
        return db.userSeries.findUnique({
            where
        });
    },
    findOneEpisode(where, db = prisma) {
        return db.userEpisode.findUnique({
            where
        });
    },
    findManySeries(where, limit, cursor, db = prisma) {
        return findManyPaginated({
            where,
            limit,
            cursor: cursor ? new Date(cursor) : undefined,
            cursorField: "lastWatchedAt",
            order: "desc",
            delegate: db.userSeries
        });
    },
    findManyEpisodes(where, db = prisma) {
        return db.userEpisode.findMany({
            where
        });
    },
    upsertSeries(where, create, update, db = prisma) {
        return db.userSeries.upsert({
            where,
            create: create,
            update: update
        });
    },
    updateManySeries(where, data, db = prisma) {
        return db.userSeries.updateMany({
            where,
            data
        });
    },
    upsertEpisode(where, data, db = prisma) {
        return db.userEpisode.upsert({
            where,
            create: data,
            update: data
        });
    },
    upsertManyEpisodes(data, db = prisma) {
        return upsertManyAndFetch({
            data,
            scalarFields: Prisma.UserEpisodeScalarFieldEnum,
            uniqueBy: ["userId", "episodeId"],
            delegate: db.userEpisode
        });
    },
    deleteManyEpisode(where, db = prisma) {
        return deleteManyAndFetch({
            where,
            delegate: db.userEpisode
        });
    },
    async getDashboardSummary(userId, db = prisma) {
        const [summaryEpisodes] = await db.$queryRaw `
        SELECT SUM(e.runtime) AS "totalWatchedMinutes", COUNT(e.id) AS "totalWatchedEpisodes" FROM "Episode" e
        INNER JOIN "UserEpisode" ue         
        ON ue."episodeId" = e.id
        WHERE ue."userId" = ${userId};
    `;
        const [summarySeries] = await db.$queryRaw `
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
    async getEpisodesFeed(userId, db = prisma) {
        return db.$queryRaw `
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
        next_episode."remainingEpisodes"

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
            (COUNT(*) OVER())::int AS "remainingEpisodes"
        FROM "Episode" e

        WHERE e."seriesId" = us."seriesId"
            AND e."seasonNumber" <> 0
            AND e."airDate" IS NOT NULL
            AND e."airDate" < CURRENT_DATE + INTERVAL '1 day'
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
    async getEpisodeFeedItem(userId, seriesId, db = prisma) {
        const [episode] = await db.$queryRaw `
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
        next_episode."remainingEpisodes"

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
          (COUNT(*) OVER())::int AS "remainingEpisodes"
        FROM "Episode" e

        WHERE e."seriesId" = us."seriesId"
          AND e."seasonNumber" <> 0
          AND e."airDate" IS NOT NULL
          AND e."airDate" < CURRENT_DATE + INTERVAL '1 day'
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
