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
    upsertEpisode(where, data, db = prisma) {
        return db.userEpisode.upsert({
            where,
            create: data,
            update: data
        });
    },
    upsertManyEpisode(data, db = prisma) {
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
    }
};
