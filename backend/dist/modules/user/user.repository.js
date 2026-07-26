import { prisma } from "../../shared/db/prisma.js";
import { findManyPaginated } from "../../shared/utils/prisma/prisma.js";
export const userRepository = {
    findOneSeries(where, db = prisma) {
        return db.userSeries.findUnique({
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
    upsertSeries(where, data, db = prisma) {
        return db.userSeries.upsert({
            where,
            create: data,
            update: data
        });
    },
    upsertEpisode(where, data, db = prisma) {
        return db.userEpisode.upsert({
            where,
            create: data,
            update: data
        });
    }
};
