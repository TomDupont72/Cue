import { prisma } from "../../shared/db/prisma.js";
export const seriesRepository = {
    findOne(where, db = prisma) {
        return db.series.findUnique({
            where
        });
    },
    upsert(where, data, db = prisma) {
        return db.series.upsert({
            where,
            create: data,
            update: data
        });
    },
    async addGenres(seriesId, genreIds, db = prisma) {
        await db.seriesGenre.createMany({
            data: genreIds.map((genreId) => ({
                seriesId,
                genreId
            })),
            skipDuplicates: true
        });
    },
    async addNetworks(seriesId, networkIds, db = prisma) {
        await db.seriesNetwork.createMany({
            data: networkIds.map((networkId) => ({
                seriesId,
                networkId
            })),
            skipDuplicates: true
        });
    },
    async addPeople(seriesId, peopleIds, db = prisma) {
        await db.seriesPeople.createMany({
            data: peopleIds.map((peopleId) => ({ seriesId, peopleId })),
            skipDuplicates: true
        });
    }
};
