import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { createManyAndFetch, deleteManyAndFetch } from "@/shared/utils/prisma/prisma.js";
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
    async createMany(episodes, db = prisma) {
        return createManyAndFetch({
            data: episodes,
            scalarFields: Prisma.EpisodeScalarFieldEnum,
            uniqueBy: "tmdbId",
            delegate: db.episode
        });
    },
    deleteMany(where, db = prisma) {
        return deleteManyAndFetch({
            where,
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
    }
};
