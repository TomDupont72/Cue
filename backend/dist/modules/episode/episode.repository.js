import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../shared/db/prisma.js";
import { upsertManyAndFetch } from "../../shared/utils/prisma/prisma.js";
export const episodeRepository = {
    findOne(where, db = prisma) {
        return db.episode.findUnique({
            where
        });
    },
    findMany(where, db = prisma) {
        return db.episode.findMany({
            where
        });
    },
    async upsertMany(episodes, db = prisma) {
        return upsertManyAndFetch({
            data: episodes,
            scalarFields: Prisma.EpisodeScalarFieldEnum,
            uniqueBy: "tmdbId",
            delegate: db.episode
        });
    },
    addPeople(data, db = prisma) {
        return db.episodePeople.createMany({
            data,
            skipDuplicates: true
        });
    },
    addCharacters(data, db = prisma) {
        return db.episodeCharacter.createMany({
            data,
            skipDuplicates: true
        });
    },
    async replacePeople(episodeIds, data, db = prisma) {
        await db.episodePeople.deleteMany({ where: { episodeId: { in: episodeIds } } });
        return this.addPeople(data, db);
    },
    async replaceCharacters(episodeIds, data, db = prisma) {
        await db.episodeCharacter.deleteMany({ where: { episodeId: { in: episodeIds } } });
        return this.addCharacters(data, db);
    }
};
