import { prisma } from "@/shared/db/prisma.js";
export const userRepository = {
    findOneSeries(where, db = prisma) {
        return db.userSeries.findUnique({
            where
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
